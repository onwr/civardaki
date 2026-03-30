const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    // Prisma query engine'i ilk HTTP isteğinden önce hazır olsun; aksi halde
    // "Engine is not yet connected" (özellikle dev / Turbopack'ta) görülebilir.
    try {
        const { prisma } = await import("./src/lib/prisma.js");
        await prisma.$connect();
    } catch (e) {
        console.error("Prisma bağlantısı kurulamadı. DATABASE_URL ve `npx prisma generate` kontrol edin:", e);
        process.exit(1);
    }

    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    const io = new Server(server, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || "*",
            methods: ["GET", "POST"]
        }
    });

    // Make io globally available for API routes
    global.io = io;

    io.on("connection", (socket) => {
        const businessId = socket.handshake.query.businessId;
        const userId = socket.handshake.query.userId;

        if (businessId) {
            const roomName = `business_${businessId}`;
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined room: ${roomName}`);
        }
        if (userId) {
            const roomName = `user_${userId}`;
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined room: ${roomName}`);
        }

        socket.on("disconnect", () => {
            console.log(`Socket ${socket.id} disconnected.`);
        });
    });

    server.once("error", (err) => {
        console.error("Server starting error:", err);
        process.exit(1);
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.io attached on path /api/socket/io`);
    });
});
