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
- [ ] **Get Signature:** `POST /api/user/sign`
- [ ] **Set Signature:** `POST /api/user/sign`

## **Admin**
- [x] **Get All Users:** `GET /api/admin/users`
- [x] **Get User by ID:** `GET /api/admin/user/:id`
- [x] **Update User Profile:** `PUT /api/admin/user/:id`
- [x] **Delete User:** `DELETE /api/admin/user/:id`

## **Document**
- [x] **Get All Documents** `GET /api/document/documents`
- [x] **Get Document** `GET /api/document/document/:id`
- [x] **Upload Document** `POST /api/document/upload`
- [x] **Create Document** `POST /api/document/create/:id`
- [ ] **Update Document Info** `POST /api/document/update/:id`
- [ ] **Sign Document:** `POST /api/document/sign/:id`
- [ ] **Get Document URL (Download):** `GET /api/document/url`
- [ ] **Delete Document** `POST /api/document/delete/:id`
