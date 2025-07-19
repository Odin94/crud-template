import { test } from "node:test"
import * as assert from "node:assert"
import { build } from "../helper"
import { generateToken } from "../../src/utils/jwt"

test("GET /users - without JWT token should return 401", async (t) => {
    const app = await build(t)

    const res = await app.inject({
        method: "GET",
        url: "/users",
    })

    assert.strictEqual(res.statusCode, 401)
    const payload = JSON.parse(res.payload)
    assert.strictEqual(payload.message, "Unauthorized: Invalid or missing token")
})

test("GET /users - with invalid JWT token should return 401", async (t) => {
    const app = await build(t)

    const res = await app.inject({
        method: "GET",
        url: "/users",
        headers: {
            authorization: "Bearer invalid.token.here",
        },
    })

    assert.strictEqual(res.statusCode, 401)
    const payload = JSON.parse(res.payload)
    assert.strictEqual(payload.message, "Unauthorized: Invalid or missing token")
})

test("POST /users - with existing email should return 409", async (t) => {
    const app = await build(t)

    const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
    }

    // First request should succeed
    const res1 = await app.inject({
        method: "POST",
        url: "/users",
        payload: userData,
    })

    assert.strictEqual(res1.statusCode, 200)

    // Second request with same email should fail
    const res2 = await app.inject({
        method: "POST",
        url: "/users",
        payload: userData,
    })

    assert.strictEqual(res2.statusCode, 409)
    const payload = JSON.parse(res2.payload)
    assert.strictEqual(payload.message, "User with this email already exists")
})

test("POST /login - with invalid credentials should return 401", async (t) => {
    const app = await build(t)

    const res = await app.inject({
        method: "POST",
        url: "/login",
        payload: {
            email: "nonexistent@example.com",
            password: "wrongpassword",
        },
    })

    assert.strictEqual(res.statusCode, 401)
    const payload = JSON.parse(res.payload)
    assert.strictEqual(payload.message, "Invalid email or password")
})
