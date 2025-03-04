# Backend Setup
- [x] Clerk Setup & Integration
- [x] Authentication with Clerk API
- [x] Supabase Connection & Integration

# API Endpoints Checklist

## **Auth**
- [x] **Register:** `POST /api/auth/register`
- [x] **Login:** `POST /api/auth/login`

## **User**
- [x] **Get Profile:** `GET /api/user/profile`
- [x] **Update Profile:** `PUT /api/user/profile`
- [x] **Change Email:** `PUT /api/user/email`
- [x] **Change Password:** `PUT /api/user/password`
- [ ] **Get Signature:** `GET /api/user/sign`
- [ ] **Set Signature:** `POST /api/user/sign`

## **Admin**
- [x] **Get All Users:** `GET /api/admin/users`
- [x] **Get User by ID:** `GET /api/admin/user/:id`
- [x] **Update User Profile:** `PUT /api/admin/user/:id`
- [x] **Delete User:** `DELETE /api/admin/user/:id`

## **Document**
- [x] **Get All Documents** `GET /api/document/documents`
- [x] **Get Document** `GET /api/document/document/:id`
- [x] **Create Document** `POST /api/document/document/:id`
- [x] **Update Document Info** `PUT /api/document/document/:id`
- [x] **Delete Document** `DELETE /api/document/delete/:id`
- [x] **Upload Document (For Create)** `POST /api/document/upload`
- [x] **Upload Document (For Update)** `POST /api/document/upload/:id`
- [x] **Get Document URL (Download):** `GET /api/document/url`
- [x] **Get All File Version (For each upload):** `GET /api/document/versions/:id`
- [ ] **Sign Document:** `POST /api/document/sign/:id`
