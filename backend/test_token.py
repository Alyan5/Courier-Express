"""
Quick test script to verify JWT token generation and decoding
Run this to test if your authentication is working correctly
"""
from utils.security import create_access_token, decode_token
import logging

logging.basicConfig(level=logging.INFO)

# Test 1: Create a token
print("=" * 50)
print("TEST 1: Creating a test staff token")
print("=" * 50)
test_payload = {"sub": "staff@test.com", "role": "staff"}
token = create_access_token(test_payload)
print(f"✓ Token created: {token[:50]}...")

# Test 2: Decode the token
print("\n" + "=" * 50)
print("TEST 2: Decoding the token")
print("=" * 50)
decoded = decode_token(token)
if decoded:
    print(f"✓ Token decoded successfully!")
    print(f"  - Email: {decoded.get('sub')}")
    print(f"  - Role: {decoded.get('role')}")
    print(f"  - Expires: {decoded.get('exp')}")
else:
    print("✗ Token decode FAILED - this is the problem!")

# Test 3: Verify SECRET_KEY is loaded
print("\n" + "=" * 50)
print("TEST 3: Checking SECRET_KEY configuration")
print("=" * 50)
from utils.security import SECRET_KEY
if SECRET_KEY:
    print(f"✓ SECRET_KEY is configured (length: {len(SECRET_KEY)} chars)")
else:
    print("✗ SECRET_KEY is NOT configured - this is a critical error!")
    print("  Make sure your .env file has: SECRET_KEY=your-secret-key")

print("\n" + "=" * 50)
print("All tests complete!")
print("=" * 50)
