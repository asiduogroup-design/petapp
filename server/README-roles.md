# How to Make a User an Admin in MongoDB

1. Open your MongoDB shell or MongoDB Compass.
2. Find the user you want to make admin (replace the email below with the user's email):

```
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

- This will set the user's role to `admin`.
- The user will now have admin access in the app (including the AdminDashboard and Admin link in the navbar).

## Alternative: Use the provided script

You can also run the provided script:

```
node setUserRole.js
```

Edit `setUserRole.js` to set the correct email and role before running.
