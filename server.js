// ============================================
// TRAVELGO - COMPLETE SERVER
// Node.js + Express + MySQL
// ============================================

require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");
const session = require("express-session");

const app = express();
const PORT = Number(process.env.PORT || 3000);

// ============================================
// 1. SESSION CONFIGURATION
// ============================================

app.use(
    session({
        name: "travelgo.sid",
        secret:
            process.env.SESSION_SECRET ||
            "travelgo-local-development-secret-change-this",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 2 * 60 * 60 * 1000
        }
    })
);

// ============================================
// 2. MIDDLEWARE
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 3. MYSQL CONNECTION
// ============================================

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "travelgo_db",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ============================================
// 4. EMAIL CONFIGURATION
// ============================================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD
    }
});

// ============================================
// 5. AUTHENTICATION MIDDLEWARE
// ============================================

function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please log in to continue."
        });
    }

    next();
}

// ============================================
// 6. PUBLIC PAGE ROUTES
// ============================================

// Homepage: open index.html
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "templates", "index.html")
    );
});

// Login page
app.get("/login.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "templates", "login.html")
    );
});

// Index page
app.get("/index.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "templates", "index.html")
    );
});

// Registration page
app.get("/register.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "templates", "register.html")
    );
});

// Forgot password page
app.get("/forgot_password.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "templates", "forgot_password.html")
    );
});

// Reset password page
app.get("/reset_password.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "templates", "reset_password.html")
    );
});

// ============================================
// 7. PROTECT PRIVATE HTML PAGES
// ============================================

const protectedPages = new Set([
    "destinations.html",
    "dashboard.html",
    "my_bookings.html",
    "booking.html",
    "book_trip.html",
    "traveller_details.html",
    "payment.html",
    "payment_success.html",
    "receipt.html",
    "profile.html"
]);

app.use((req, res, next) => {
    let filename;

    try {
        filename = path
            .basename(decodeURIComponent(req.path))
            .toLowerCase();
    } catch (error) {
        return res.status(400).send("Invalid request path.");
    }

    if (!protectedPages.has(filename)) {
        return next();
    }

    if (req.session && req.session.userId) {
        return next();
    }

    if (req.method === "GET" && !req.path.startsWith("/api/")) {
        return res.redirect("/login.html");
    }

    return res.status(401).json({
        success: false,
        message: "Please log in to continue."
    });
});

// ============================================
// 8. SERVE STATIC FILES
// ============================================

// CSS, JavaScript and other static assets
app.use(
    "/static",
    express.static(path.join(__dirname, "static"))
);

// Serve HTML files from the templates folder
app.use(
    express.static(path.join(__dirname, "templates"))
);

// ============================================
// 9. DATABASE HEALTH CHECK
// ============================================

app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS database_name"
        );

        return res.json({
            success: true,
            message: "TravelGo backend is running!",
            database: rows[0].database_name
        });
    } catch (error) {
        console.error(
            "Database health check failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Could not connect to MySQL."
        });
    }
});

// ============================================
// 10. GET CURRENT LOGGED-IN USER
// ============================================
app.get("/api/test-route", (req, res) => {
    res.json({
        success: true,
        message: "TravelGo API routes are working!"
    });
});

app.get("/api/me", requireLogin, async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT id, name, email, phone
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [req.session.userId]
        );

        if (users.length === 0) {
            return req.session.destroy(() => {
                res.status(401).json({
                    success: false,
                    message:
                        "User account not found. Please log in again."
                });
            });
        }

        return res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error(
            "Current user query failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve your account."
        });
    }
});
// ============================================
// 11. REGISTER NEW USER
// ============================================

app.post("/api/register", async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();

        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const phone = String(req.body.phone || "")
            .replace(/[\s()-]/g, "");

        const password = String(req.body.password || "");

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name must not exceed 100 characters."
            });
        }

        if (
            email.length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (!/^\+?[0-9]{7,15}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid phone number."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                success: false,
                message: "Please choose a shorter password."
            });
        }

        const [existingUsers] = await db.execute(
            `SELECT id
             FROM users
             WHERE email = ? OR phone = ?
             LIMIT 1`,
            [email, phone]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email or phone already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [result] = await db.execute(
            `INSERT INTO users (name, email, phone, password)
             VALUES (?, ?, ?, ?)`,
            [name, email, phone, passwordHash]
        );

        console.log(
            "Registered TravelGo user ID:",
            result.insertId
        );

        return res.status(201).json({
            success: true,
            message: "Registration successful!"
        });
    } catch (error) {
        console.error("Registration failed:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message:
                    "This email or phone number is already registered."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
});

// ============================================
// 12. LOGIN
// ============================================

app.post("/api/login", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const password = String(req.body.password || "");

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password."
            });
        }

        const [users] = await db.execute(
            `SELECT id, name, email, phone, password
             FROM users
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        req.session.regenerate((err) => {
            if (err) {
                console.error(
                    "Session creation failed:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to create login session."
                });
            }

            req.session.userId = user.id;

            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error(
                        "Session save failed:",
                        saveErr.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to save login session."
                    });
                }

                console.log("User logged in. ID:", user.id);

                return res.json({
                    success: true,
                    message: "Login successful!",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                    }
                });
            });
        });
    } catch (error) {
        console.error("Login failed:", error.message);

        return res.status(500).json({
            success: false,
            message:
                "Unable to process login. Please try again."
        });
    }
});

// ============================================
// 13. LOGOUT
// ============================================

app.post("/api/logout", (req, res) => {
    if (!req.session) {
        return res.json({
            success: true,
            message: "Logged out successfully."
        });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Logout failed:", err.message);

            return res.status(500).json({
                success: false,
                message: "Unable to log out."
            });
        }

        res.clearCookie("travelgo.sid");

        return res.json({
            success: true,
            message: "Logged out successfully."
        });
    });
});
// ============================================
// 14. FORGOT PASSWORD
// ============================================

app.post("/api/forgot-password", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        if (
            !email ||
            email.length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const genericMessage =
            "If an account matches that email, password-reset instructions will be sent.";

        const [users] = await db.execute(
            `SELECT id, email
             FROM users
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        if (users.length === 0) {
            return res.json({
                success: true,
                message: genericMessage
            });
        }

        const user = users[0];

        const token = crypto.randomBytes(32).toString("hex");

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await db.execute(
            `UPDATE password_reset_tokens
             SET used_at = NOW()
             WHERE user_id = ?
               AND used_at IS NULL`,
            [user.id]
        );

        await db.execute(
            `INSERT INTO password_reset_tokens
                (user_id, token_hash, expires_at)
             VALUES (?, ?, ?)`,
            [user.id, tokenHash, expiresAt]
        );

        const baseUrl = (
            process.env.APP_BASE_URL ||
            `http://localhost:${PORT}`
        ).replace(/\/+$/, "");

        const resetLink =
            `${baseUrl}/reset_password.html?token=${token}`;

        try {
            await transporter.sendMail({
                from: process.env.MAIL_USER,
                to: user.email,
                subject: "TravelGo Password Reset",

                text:
                    "We received a request to reset your TravelGo password.\n\n" +
                    `Open this link to choose a new password:\n${resetLink}\n\n` +
                    "This link expires in 15 minutes and can only be used once.\n\n" +
                    "If you did not request this, you can ignore this email.",

                html: `
                    <div style="font-family:Arial,sans-serif;line-height:1.6">
                        <h2>✈️ TravelGo Password Reset</h2>

                        <p>
                            We received a request to reset your password.
                        </p>

                        <p>
                            <a href="${resetLink}"
                               style="display:inline-block;
                                      padding:12px 20px;
                                      background:#087eaa;
                                      color:white;
                                      text-decoration:none;
                                      border-radius:8px">
                                Reset My Password
                            </a>
                        </p>

                        <p>
                            This link expires in 15 minutes and can only be used once.
                        </p>

                        <p>
                            If you did not request this, you can ignore this email.
                        </p>
                    </div>
                `
            });
        } catch (emailError) {
            await db.execute(
                `UPDATE password_reset_tokens
                 SET used_at = NOW()
                 WHERE token_hash = ?
                   AND used_at IS NULL`,
                [tokenHash]
            );

            throw emailError;
        }

        return res.json({
            success: true,
            message: genericMessage
        });

    } catch (error) {
        console.error(
            "Password-reset request failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to process your request right now. Please try again."
        });
    }
});


// ============================================
// 15. RESET PASSWORD
// ============================================

app.post("/api/reset-password", async (req, res) => {
    let connection;

    try {
        const token = String(req.body.token || "").trim();
        const password = String(req.body.password || "");

        if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid or missing reset link. Please request a new one."
            });
        }

        if (
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters and no more than 72 bytes."
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const [tokens] = await db.execute(
            `SELECT id, user_id
             FROM password_reset_tokens
             WHERE token_hash = ?
               AND used_at IS NULL
               AND expires_at > NOW()
             LIMIT 1`,
            [tokenHash]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "This reset link is invalid, expired, or already used. Please request a new one."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [validTokens] = await connection.execute(
                `SELECT id, user_id
                 FROM password_reset_tokens
                 WHERE id = ?
                   AND token_hash = ?
                   AND used_at IS NULL
                   AND expires_at > NOW()
                 FOR UPDATE`,
                [tokens[0].id, tokenHash]
            );

            if (validTokens.length === 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "This reset link is invalid, expired, or already used. Please request a new one."
                });
            }

            const [updateResult] = await connection.execute(
                `UPDATE users
                 SET password = ?
                 WHERE id = ?`,
                [
                    hashedPassword,
                    validTokens[0].user_id
                ]
            );

            if (updateResult.affectedRows !== 1) {
                throw new Error(
                    "Could not update the account password."
                );
            }

            await connection.execute(
                `UPDATE password_reset_tokens
                 SET used_at = NOW()
                 WHERE id = ?`,
                [validTokens[0].id]
            );

            await connection.commit();

        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        }

        return res.json({
            success: true,
            message:
                "Password reset successfully! Redirecting to login..."
        });

    } catch (error) {
        console.error(
            "Password reset failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to reset your password right now. Please try again."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});
// ============================================
// 16. GET DESTINATIONS
// Requires login
// ============================================

app.get(
    "/api/destinations",
    requireLogin,
    async (req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT
                    id,
                    name,
                    location,
                    description,
                    image,
                    price,
                    duration
                 FROM destinations
                 ORDER BY id`
            );

            return res.json({
                success: true,
                destinations: rows
            });

        } catch (error) {
            console.error(
                "Destination query failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve destinations."
            });
        }
    }
);


// ============================================
// 17. SAVE BOOKING, TRAVELLERS & DEMO PAYMENT
// ============================================

app.post(
    "/api/bookings/complete",
    requireLogin,
    async (req, res) => {
        let connection;
        let transactionStarted = false;

        try {
            const userId = req.session.userId;
            const destinationId = Number(req.body.destination_id);
            const travelDate = String(req.body.travel_date || "");
            const persons = Number(req.body.persons);
            const totalAmount = Number(req.body.total_amount);
            const travellers = req.body.travellers;

            const paymentMethod = String(
                req.body.payment_method || "Demo"
            ).trim();
            console.log("Selected payment method:", paymentMethod);


            if (
                !Number.isInteger(destinationId) ||
                destinationId <= 0 ||
                !Number.isInteger(persons) ||
                persons < 1 ||
                persons > 20 ||
                !Number.isFinite(totalAmount) ||
                totalAmount <= 0 ||
                !Array.isArray(travellers) ||
                travellers.length !== persons
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking or traveller details."
                });
            }

            if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid travel date."
                });
            }

            const dateParts = travelDate.split("-").map(Number);

            const parsedDate = new Date(
                dateParts[0],
                dateParts[1] - 1,
                dateParts[2]
            );

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (
                parsedDate.getFullYear() !== dateParts[0] ||
                parsedDate.getMonth() !== dateParts[1] - 1 ||
                parsedDate.getDate() !== dateParts[2] ||
                parsedDate < today
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Travel date must be today or a future date."
                });
            }

            if (
                !paymentMethod ||
                paymentMethod.length > 50
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment method."
                });
            }

            for (const traveller of travellers) {
                if (
                    !traveller ||
                    typeof traveller.name !== "string" ||
                    !traveller.name.trim() ||
                    !Number.isInteger(Number(traveller.age)) ||
                    Number(traveller.age) < 1 ||
                    Number(traveller.age) > 120 ||
                    !["Male", "Female", "Other"].includes(
                        traveller.gender
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Please check the traveller details."
                    });
                }
            }

            connection = await db.getConnection();

            await connection.beginTransaction();
            transactionStarted = true;

            const [users] = await connection.execute(
                "SELECT id FROM users WHERE id = ?",
                [userId]
            );

            if (users.length === 0) {
                await connection.rollback();
                transactionStarted = false;

                return res.status(401).json({
                    success: false,
                    message:
                        "User account not found. Please log in again."
                });
            }

            const [destinations] = await connection.execute(
                `SELECT id, price
                 FROM destinations
                 WHERE id = ?`,
                [destinationId]
            );

            if (destinations.length === 0) {
                await connection.rollback();
                transactionStarted = false;

                return res.status(404).json({
                    success: false,
                    message: "Destination not found."
                });
            }

            // Calculate the amount using the database price.
            const databasePrice = Number(destinations[0].price);

            const expectedTotal = Number(
                (databasePrice * persons).toFixed(2)
            );

            if (
                Math.abs(expectedTotal - totalAmount) > 0.01
            ) {
                await connection.rollback();
                transactionStarted = false;

                return res.status(400).json({
                    success: false,
                    message:
                        "The booking total does not match the destination price.",
                    expected_total: expectedTotal
                });
            }

            // Save booking.
            const [bookingResult] = await connection.execute(
                `INSERT INTO bookings
                    (user_id, destination_id, travel_date,
                     persons, total_amount, status)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    destinationId,
                    travelDate,
                    persons,
                    expectedTotal,
                    "Confirmed"
                ]
            );

            const bookingId = bookingResult.insertId;

            console.log("Booking ID:", bookingId);
            console.log("Payment amount:", expectedTotal);

            // Save traveller details.
            for (const traveller of travellers) {
                await connection.execute(
                    `INSERT INTO travellers
                        (booking_id, full_name, age, gender, phone, email)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        bookingId,
                        traveller.name.trim(),
                        Number(traveller.age),
                        traveller.gender,
                        String(traveller.phone || "").trim() || null,
                        String(traveller.email || "")
                            .trim()
                            .toLowerCase() || null
                    ]
                );
            }

            // DEMO PAYMENT ONLY.
            // This does not verify a real bank or UPI transaction.
            const [paymentResult] = await connection.execute(
                `INSERT INTO payments
                    (booking_id, payment_method, transaction_id,
                     amount, payment_status)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    bookingId,
                    paymentMethod,
                    null,
                    expectedTotal,
                    "Demo"
                ]
            );

            await connection.commit();
            transactionStarted = false;
            

            return res.status(201).json({
                success: true,
                message: "Booking saved successfully!",

                booking: {
                    id: bookingId,
                    destination_id: destinationId,
                    travel_date: travelDate,
                    persons: persons,
                    total_amount: expectedTotal,
                    status: "Confirmed"
                },

                payment: {
                    id: paymentResult.insertId,
                    status: "Demo",
                    message:
                        "Demonstration payment record saved;  real transaction was verified."
                }
            });

        } catch (error) {
            if (connection && transactionStarted) {
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.error(
                        "Booking rollback failed:",
                        rollbackError.message
                    );
                }
            }

            console.error(
                "Booking save failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to save the booking. Please try again."
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
);


// ============================================
// 18. GET BOOKINGS FOR LOGGED-IN USER
// ============================================

app.get(
    "/api/bookings",
    requireLogin,
    async (req, res) => {
        try {
            const userId = req.session.userId;

            const [bookings] = await db.execute(
                `SELECT
                    b.id,
                    b.destination_id,
                    d.name AS destination,
                    d.location,
                    b.travel_date,
                    b.persons,
                    b.total_amount,
                    b.status,
                    b.booking_date,
                    p.payment_method,
                    p.payment_status
                 FROM bookings b
                 JOIN destinations d
                    ON d.id = b.destination_id
                 LEFT JOIN payments p
                    ON p.booking_id = b.id
                 WHERE b.user_id = ?
                 ORDER BY b.booking_date DESC`,
                [userId]
            );

            return res.json({
                success: true,
                bookings: bookings.map((booking) => ({
                    ...booking,
                    total_amount: Number(booking.total_amount)
                }))
            });

        } catch (error) {
            console.error(
                "Booking history query failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve booking history."
            });
        }
    }
);
// ============================================
// 19. GET TRAVELLERS FOR A USER'S BOOKING
// ============================================

app.get(
    "/api/bookings/:id/travellers",
    requireLogin,
    async (req, res) => {
        try {
            const bookingId = Number(req.params.id);
            const userId = req.session.userId;

            if (
                !Number.isInteger(bookingId) ||
                bookingId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking ID."
                });
            }

            const [rows] = await db.execute(
                `SELECT
                    t.id,
                    t.full_name,
                    t.age,
                    t.gender,
                    t.phone,
                    t.email
                 FROM travellers t
                 JOIN bookings b
                    ON b.id = t.booking_id
                 WHERE b.id = ?
                   AND b.user_id = ?
                 ORDER BY t.id`,
                [bookingId, userId]
            );

            return res.json({
                success: true,
                travellers: rows
            });

        } catch (error) {
            console.error(
                "Traveller query failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to retrieve traveller details."
            });
        }
    }
);


// ============================================
// 20. SAVE A DESTINATION REVIEW
// ============================================

app.post(
    "/api/reviews",
    requireLogin,
    async (req, res) => {
        try {
            const userId = req.session.userId;
            const destinationId = Number(req.body.destination_id);
            const rating = Number(req.body.rating);
            const comment = String(
                req.body.comment || ""
            ).trim();

            if (
                !Number.isInteger(destinationId) ||
                destinationId <= 0 ||
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5 ||
                comment.length > 2000
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a valid rating and review."
                });
            }

            const [destinations] = await db.execute(
                "SELECT id FROM destinations WHERE id = ?",
                [destinationId]
            );

            if (destinations.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Destination not found."
                });
            }

            const [result] = await db.execute(
                `INSERT INTO reviews
                    (user_id, destination_id, rating, comment)
                 VALUES (?, ?, ?, ?)`,
                [
                    userId,
                    destinationId,
                    rating,
                    comment || null
                ]
            );

            return res.status(201).json({
                success: true,
                message: "Review saved successfully!",
                review_id: result.insertId
            });

        } catch (error) {
            console.error(
                "Review save failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to save the review."
            });
        }
    }
);


// ============================================
// 21. GET DESTINATION REVIEWS
// ============================================

app.get(
    "/api/reviews",
    async (req, res) => {
        try {
            const destinationId = req.query.destination_id;

            let sql = `
                SELECT
                    r.id,
                    r.destination_id,
                    r.rating,
                    r.comment,
                    r.review_date,
                    u.name AS reviewer_name
                FROM reviews r
                JOIN users u
                    ON u.id = r.user_id
            `;

            const params = [];

            if (destinationId !== undefined) {
                const id = Number(destinationId);

                if (
                    !Number.isInteger(id) ||
                    id <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid destination ID."
                    });
                }

                sql += " WHERE r.destination_id = ?";
                params.push(id);
            }

            sql += " ORDER BY r.review_date DESC";

            const [reviews] = await db.execute(
                sql,
                params
            );

            return res.json({
                success: true,
                reviews
            });

        } catch (error) {
            console.error(
                "Review query failed:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve reviews."
            });
        }
    }
);


// ============================================
// 22. HANDLE UNKNOWN ROUTES
// ============================================

app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            success: false,
            message: "API endpoint not found."
        });
    }

    return res.status(404).send(
        "TravelGo: Page not found."
    );
});


// ============================================
// 23. START SERVER
// ============================================

async function startServer() {
    try {
        const connection = await db.getConnection();

        try {
            const [rows] = await connection.query(
                "SELECT DATABASE() AS database_name"
            );

            console.log("MySQL connection successful!");

            console.log(
                "Connected database:",
                rows[0].database_name
            );

        } finally {
            connection.release();
        }

        app.listen(PORT,"0.0.0.0", () => {
            console.log("");
            console.log(
                "✈️ TravelGo backend is running!"
            );

            console.log(
                `🌐 Website: http://localhost:${PORT}`
            );

            console.log(
                `🔎 Database: http://localhost:${PORT}/api/health`
            );
        });

    } catch (error) {
        console.error(
            "Unable to start TravelGo:",
            error.message
        );

        process.exitCode = 1;
    }
}

startServer();
