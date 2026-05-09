http://localhost:3000/api/auth/register
    {
  "username": "test",
  "email": "test@example.com",
  "password": "123456"
}

http://localhost:3000/api/auth/login
    { 
  "email": "test@example.com",
  "password": "123456"
}

http://localhost:3000/api/auth/logout

http://localhost:3000/api/analytics  (GET, auth required)  
    // returns the current user's connection count, unread messages, profile view count and recent activity feed
