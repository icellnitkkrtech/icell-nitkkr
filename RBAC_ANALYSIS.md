# RBAC (Role-Based Access Control) Analysis Report

**Generated**: April 12, 2026

---

## 1. ROLE DEFINITIONS

### Defined Roles

The system implements a **4-tier role hierarchy**:

| Role            | Description                    | Authority Level | Default? |
| --------------- | ------------------------------ | --------------- | -------- |
| **student**     | Regular student member         | Base (Level 1)  | ✅ Yes   |
| **member**      | Promoted student (full member) | Level 2         | ❌ No    |
| **post_holder** | Leadership/management position | Level 2         | ❌ No    |
| **admin**       | Full system administrator      | Level 3         | ❌ No    |

### Database Schema (MongoDB - `profiles` collection)

**User object from [backend/models/authModel.js](backend/models/authModel.js#L1-L40):**

```javascript
{
  _id: "uuid",
  email: string,
  password: hashed,
  name: string,
  role: "student" | "member" | "post_holder" | "admin",  // Default: "student"
  is_member: boolean,
  post_position: null | string,  // ⚠️ COLLECTED BUT NOT SAVED (see issue)
  email_verified: boolean,  // ⚠️ Required for login
  verification_token_hash: string,
  verification_token_expires_at: Date,
  created_at: Date,
  updated_at: Date
}
```

### Role Functions in [backend/models/authModel.js](backend/models/authModel.js)

```javascript
// Create user (default role = "student")
createUser(email, password, name, phone, branch, year)
  → role: "student"

// Promote student to member/post_holder
promoteStudent(studentId, newRole, postPosition)
  → newRole: "member" | "post_holder"

// Update user role
updateUserRole(userId, role)
  → Allows any role change

// Get role-based lists
getAllStudents()  // role: student, member | email_verified: true
getAllStudentsAdmin()  // role: student, member, post_holder | email_verified: true
```

---

## 2. AUTHENTICATION FLOW

### Login Process

[backend/controllers/authController.js](backend/controllers/authController.js#L116-L150)

1. **Email/Password validation**
2. **Password hash verification** (bcryptjs)
3. **Email verification check** (`email_verified` flag required)
4. **Token generation** ← Role embedded here
5. **Return user object** with role

### Token Generation & Storage

[backend/utils/jwt.js](backend/utils/jwt.js)

```javascript
// Tokens embed the role
generateToken(userId, email, role = "member")
  → JWT signed with payload: { userId, email, role }
  → Expires in: 7 days

generateRefreshToken(userId)
  → JWT signed with payload: { userId }
  → Expires in: 30 days
```

### Token Usage

[backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js#L1-L35)

**Where role is extracted and stored in request:**

```javascript
export function verifyUser(req, res, next) {
  const token = authHeader.split(" ")[1]; // Extract from "Bearer {token}"
  const payload = verifyToken(token);

  req.user = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role, // ← Role attached to request
  };
}
```

---

## 3. BACKEND MIDDLEWARE - AUTHORIZATION CHECKS

### Middleware Files

#### [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js)

```javascript
export function verifyUser(req, res, next)
  → Verifies token validity
  → Extracts userId, email, role from token
  → No role checking (just authentication)

export function requireAdmin(req, res, next)
  → ✅ Allows: "admin" OR "post_holder"
  → ❌ Rejects: "student" or "member"
  → Status 403: "Admin access required"
```

**Code:**

```javascript
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin" && req.user?.role !== "post_holder") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
```

#### [backend/middleware/adminMiddleware.js](backend/middleware/adminMiddleware.js)

```javascript
export const isAdmin = (req, res, next)
  → ✅ Allows: "admin" ONLY
  → ❌ Rejects: "post_holder", "member", "student"
  → Status 403: "Admin access only"
```

**Code:**

```javascript
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};
```

### ⚠️ MIDDLEWARE INCONSISTENCY ALERT

**Problem**: Two different middleware have conflicting rules!

- `requireAdmin` → admin OR post_holder
- `isAdmin` → admin ONLY

This creates confusion:

- Routes using `requireAdmin` allow post_holders
- Routes using `isAdmin` reject post_holders
- **No clear pattern or documentation** on which should be used where

---

## 4. BACKEND ROUTES - AUTHORIZATION PATTERNS

### Admin Routes ([backend/routes/adminRoutes.js](backend/routes/adminRoutes.js))

**Middleware**: All use `verifyUser` + `requireAdmin`  
**Access**: Admin + Post Holder

```
GET    /api/admin/stats                          ← requires: requireAdmin
GET    /api/admin/members                        ← requires: requireAdmin
POST   /api/admin/promote-member                 ← requires: requireAdmin
GET    /api/admin/students/verified              ← requires: requireAdmin
GET    /api/admin/students/all                   ← requires: requireAdmin
POST   /api/admin/students/promote               ← requires: requireAdmin
POST   /api/admin/students/change-role           ← requires: requireAdmin
POST   /api/admin/students/demote                ← requires: requireAdmin
POST   /api/admin/students/delete-unverified     ← requires: requireAdmin
GET    /api/admin/cleanup/stats                  ← requires: requireAdmin
POST   /api/admin/cleanup/trigger                ← requires: requireAdmin
```

✅ **Post Holder Access**: YES - All admin routes allow post_holders

---

### Auth Routes ([backend/routes/authRoutes.js](backend/routes/authRoutes.js))

**Public:**

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/setup-admin
GET    /api/auth/verify-email
```

**Protected (authenticated users):**

```
GET    /api/auth/profile                        ← requires: verifyUser
PUT    /api/auth/profile                        ← requires: verifyUser
GET    /api/auth/attendance                     ← requires: verifyUser
```

**Admin Only:**

```
GET    /api/auth/students                       ← requires: verifyUser + requireAdmin
POST   /api/auth/students                       ← requires: verifyUser + requireAdmin
DELETE /api/auth/students/:id                   ← requires: verifyUser + requireAdmin
GET    /api/auth/students/filter                ← requires: verifyUser + requireAdmin
POST   /api/auth/promote-student                ← requires: verifyUser + requireAdmin
```

✅ **Post Holder Access**: YES - All student management endpoints allow post_holders

---

### Blog Routes ([backend/routes/blogRoutes.js](backend/routes/blogRoutes.js))

```
# Public
GET    /api/blogs                                ← Public (approved blogs only)
GET    /api/blogs/:id                            ← Public

# Protected
POST   /api/blogs                                ← verifyUser (any authenticated user)
GET    /api/blogs/user/:userId                   ← verifyUser

# Admin Only
GET    /api/blogs/admin/all                      ← verifyUser + requireAdmin
PATCH  /api/blogs/:id/status                     ← verifyUser + requireAdmin
DELETE /api/blogs/:id                            ← verifyUser + requireAdmin
```

✅ **Post Holder Access**: YES - Can approve/reject/delete blogs

---

### Events Routes ([backend/routes/eventsRoutes.js](backend/routes/eventsRoutes.js))

```
# Public
GET    /api/events                               ← Public
GET    /api/events/upcoming                      ← Public

# Student (authenticated)
GET    /api/events/:id/check-my-certificate      ← verifyUser
GET    /api/events/:id/my-certificate            ← verifyUser
GET    /api/events/:id                           ← Public

# Admin Only - Events CRUD
POST   /api/events                               ← verifyUser + requireAdmin
PATCH  /api/events/:id                           ← verifyUser + requireAdmin
DELETE /api/events/:id                           ← verifyUser + requireAdmin

# Admin Only - Attendance
POST   /api/events/:eventId/attendance           ← verifyUser + requireAdmin
GET    /api/events/:eventId/attendance           ← verifyUser + requireAdmin

# Student
GET    /api/events/student/attendance            ← verifyUser
GET    /api/events/student/attendance/stats      ← verifyUser
```

✅ **Post Holder Access**: YES - Can create/update/delete events and manage attendance

---

### Newsletter Routes ([backend/routes/newsletterRoutes.js](backend/routes/newsletterRoutes.js))

```
# Public
GET    /api/newsletters                          ← Public
GET    /api/newsletters/:id                      ← Public

# Admin Only
POST   /api/newsletters                          ← verifyUser + requireAdmin
PATCH  /api/newsletters/:id                      ← verifyUser + requireAdmin
DELETE /api/newsletters/:id                      ← verifyUser + requireAdmin
POST   /api/newsletters/:id/download             ← Public (tracking)
```

✅ **Post Holder Access**: YES - Can create/edit/delete newsletters

---

### Gallery Routes ([backend/routes/galleryRoutes.js](backend/routes/galleryRoutes.js))

```
# Public
GET    /api/gallery                              ← Public
GET    /api/gallery/tags                         ← Public
GET    /api/gallery/:event                       ← Public

# Admin Only
POST   /api/gallery                              ← verifyUser + requireAdmin
DELETE /api/gallery/:id                          ← verifyUser + requireAdmin
```

✅ **Post Holder Access**: YES - Can upload/delete photos

---

### Gallery Groups Routes ([backend/routes/galleryGroupRoutes.js](backend/routes/galleryGroupRoutes.js))

```
# Public
GET    /api/gallery-groups                       ← Public
GET    /api/gallery-groups/:groupId              ← Public

# Admin Only
POST   /api/gallery-groups                       ← verifyUser + requireAdmin
PATCH  /api/gallery-groups/:groupId              ← verifyUser + requireAdmin
DELETE /api/gallery-groups/:groupId              ← verifyUser + requireAdmin
POST   /api/gallery-groups/:groupId/images       ← verifyUser + requireAdmin
DELETE /api/gallery-groups/:groupId/images/:id   ← verifyUser + requireAdmin
PATCH  /api/gallery-groups/:groupId/thumbnail    ← verifyUser + requireAdmin
```

✅ **Post Holder Access**: YES - Can manage gallery groups

---

### Student Routes ([backend/routes/studentRoutes.js](backend/routes/studentRoutes.js))

```
# Public
GET    /api/students/post-holders                ← Public

# Protected
GET    /api/students                             ← verifyUser
GET    /api/students/:id                         ← verifyUser

# Admin Only
POST   /api/students/promote                     ← verifyUser + requireAdmin
```

✅ **Post Holder Access**: YES - Can promote students

---

### Certificates Routes ([backend/routes/certificateRoutes.js](backend/routes/certificateRoutes.js))

```
# User
GET    /api/certificates/user/all                ← verifyUser
GET    /api/certificates/member/download         ← verifyUser
GET    /api/certificates/postholder/download     ← verifyUser
GET    /api/certificates/event/download/:id      ← verifyUser
GET    /api/certificates/preview/:id             ← verifyUser

# Admin Only
GET    /api/certificates/admin/all               ← verifyUser + requireAdmin
POST   /api/certificates/admin/upload-csv        ← verifyUser + requireAdmin
POST   /api/certificates/admin/issue-batch       ← verifyUser + requireAdmin
DELETE /api/certificates/admin/:id               ← verifyUser + requireAdmin
```

✅ **Post Holder Access**: YES - Can upload CSV, issue batch, delete certificates

---

### Event Attendance Routes ([backend/routes/eventAttendanceRoutes.js](backend/routes/eventAttendanceRoutes.js))

```
# Admin Only (⚠️ Uses isAdmin NOT requireAdmin)
POST   /api/event-attendance/mark                ← verifyUser + isAdmin
GET    /api/event-attendance/event               ← verifyUser + isAdmin
GET    /api/event-attendance/events/list         ← verifyUser + isAdmin
GET    /api/event-attendance/main-events         ← verifyUser + isAdmin
GET    /api/event-attendance/attendance-only     ← verifyUser + isAdmin
POST   /api/event-attendance/students/bulk-stats ← verifyUser + isAdmin

# Protected
GET    /api/event-attendance/student/:id         ← verifyUser
GET    /api/event-attendance/student/:id/stats   ← verifyUser
```

❌ **Post Holder Access**: NO - Uses `isAdmin` which only allows "admin" role

---

### Team Routes ([backend/routes/teamRoutes.js](backend/routes/teamRoutes.js))

```
# Public
GET    /api/teams                                ← Public
```

✅ **Post Holder Access**: N/A (public endpoint)

---

## 5. CONTROLLER ROLE CHECKS

### Blog Controller ([backend/controllers/blogController.js](backend/controllers/blogController.js))

**No explicit role checks in controller** - All checks happen in middleware

- `getBlogs()` - No check (public)
- `getBlogById()` - No check (public)
- `createBlog()` - No check (anyone authenticated can submit)
- `patchBlogStatus()` - No check (middleware ensures admin/post_holder)
- `deleteBlog()` - No check (middleware ensures admin/post_holder)
- `getUserBlogs()` - No check (anyone can view their own)

---

### Admin Controller ([backend/controllers/adminController.js](backend/controllers/adminController.js#L1-L200))

**No explicit role rechecks in controller** - Middleware handles all authorization

- `getStats()` - Trusted (after requireAdmin)
- `getAllMembers()` - Trusted (after requireAdmin)
- `promoteMember()` - Trusted (after requireAdmin)
- `getVerifiedStudents()` - Trusted (after requireAdmin)
- `getAllStudentsAdmin()` - Trusted (after requireAdmin)
- `promoteStudent()` - Trusted (after requireAdmin)

**Finding**: Controllers assume middleware already verified access. No redundant checks.

---

### Events Controller ([backend/controllers/eventsController.js](backend/controllers/eventsController.js#L1-L100))

**No explicit role checks** - Middleware handles authorization

- `listEvents()` - Public
- `getEvent()` - Public
- `createEvent()` - Trusted (after requireAdmin)
- `updateEvent()` - Trusted (after requireAdmin)
- `deleteEvent()` - Trusted (after requireAdmin)
- `markAttendance()` - Trusted (after requireAdmin)

---

## 6. ROLE STORAGE & TRANSMISSION

### How Role Reaches Controllers

```
Login Request
    ↓
← JWT Token issued (includes role in payload)
    ↓
API Request: GET /api/admin/stats
  Headers: Authorization: Bearer {token}
    ↓
verifyUser middleware
  ├─ Extracts token
  ├─ Verifies signature
  ├─ Decodes: { userId, email, role }
  └─ Sets req.user = { userId, email, role }
    ↓
requireAdmin middleware
  └─ Checks req.user.role === "admin" || req.user.role === "post_holder"
    ↓
Controller (e.g., getStats)
  └─ Uses req.user.userId for queries
```

---

## 7. FRONTEND API CALLS (NOT YET IMPLEMENTED)

### Status

❌ **Frontend context and services directories do not exist yet**

The workspace shows:

```
frontend/
  ├─ context/    ← MISSING (AuthContext.jsx not found)
  └─ services/   ← MISSING (api.js not found)
```

### What's Missing

1. **AuthContext.jsx** - How is auth state and role stored?
2. **api.js** - How are admin API calls made?
3. No visible frontend code to analyze role-based conditional rendering

---

## 8. AUTHORIZATION SUMMARY TABLE

| Feature                   | Admin | Post Holder | Member | Student |
| ------------------------- | ----- | ----------- | ------ | ------- |
| **User Management**       | ✅    | ✅          | ❌     | ❌      |
| Create Events             | ✅    | ✅          | ❌     | ❌      |
| Manage Event Attendance\* | ✅    | ❌\*\*      | ❌     | ❌      |
| Approve/Reject Blogs      | ✅    | ✅          | ❌     | ❌      |
| Upload Gallery Photos     | ✅    | ✅          | ❌     | ❌      |
| Manage Newsletter         | ✅    | ✅          | ❌     | ❌      |
| Issue Certificates        | ✅    | ✅          | ❌     | ❌      |
| Create Blog Posts         | ✅    | ✅          | ✅     | ✅      |
| View Public Content       | ✅    | ✅          | ✅     | ✅      |
| Dashboard Stats           | ✅    | ✅          | ❌     | ❌      |

**\* Event Attendance** - Uses `isAdmin` middleware (admin only)  
**\*\* Post Holder** - Cannot manage attendance due to `isAdmin` check

---

## 9. CRITICAL ISSUES IDENTIFIED

### Issue #1: Post Holder Access Inconsistency ⚠️ HIGH

**Problem**: Post holders are allowed by `requireAdmin` middleware but rejected by `isAdmin` middleware.

**Affected Endpoints** (admin only, no post_holder access):

- POST `/api/event-attendance/mark` - Mark attendance
- GET `/api/event-attendance/event` - View attendance records
- GET `/api/event-attendance/events/list` - List events with attendance
- POST `/api/event-attendance/students/bulk-stats` - Bulk attendance stats

**Current Code** ([backend/routes/eventAttendanceRoutes.js](backend/routes/eventAttendanceRoutes.js#L8-L15)):

```javascript
router.post("/mark", verifyUser, isAdmin, markStudentAttendance);
router.get("/event", verifyUser, isAdmin, getEventAttendance);
router.post(
  "/students/bulk-stats",
  verifyUser,
  isAdmin,
  getBulkStudentsAttendanceStats
);
```

**Is this intentional?**

- ❓ No documentation explains why event attendance is admin-only
- ❓ No clear definition of post_holder responsibilities
- ⚠️ Suggests incomplete RBAC design

**Recommendation**: Decide if post_holders should:

1. **Keep current behavior**: Admin-only - Change all requireAdmin to isAdmin for consistency
2. **Allow post_holders**: Change event attendance routes to use requireAdmin

---

### Issue #2: Post Position Not Stored ⚠️ MEDIUM

**Problem**: The `post_position` field exists in the database schema but is never saved.

**Status**: Already documented in [STUDENT_ROLE_SYSTEM_IMPLEMENTATION.md](/memories/repo/STUDENT_ROLE_SYSTEM_IMPLEMENTATION.md#L79)

**Files affected**:

- [backend/models/authModel.js](backend/models/authModel.js) - Has `post_position` parameter but doesn't save it
- [backend/controllers/adminController.js](backend/controllers/adminController.js) - `promoteStudent()` ignores position parameter
- Frontend (doesn't exist yet) - Will collect but can't send it

**Code showing the issue** ([backend/models/authModel.js](backend/models/authModel.js#L144)):

```javascript
export async function promoteStudent(studentId, newRole, postPosition = null) {
  // postPosition parameter exists but is never used!
  const result = await profiles.updateOne(
    { _id: studentId },
    { $set: { role: newRole, updated_at: new Date() } } // post_position missing
  );
}
```

---

### Issue #3: No Granular Role Checks in Controllers 🟡 LOW

**Current Practice**: Security relies 100% on middleware

**Risk**: If someone bypasses middleware or adds new endpoints, no safety net exists

**Example** ([backend/controllers/adminController.js](backend/controllers/adminController.js#L24)):

```javascript
export async function getStats(req, res) {
  // Assumes middleware already verified req.user is admin/post_holder
  // No additional check: if (!req.user?.role?.includes('admin')) { ... }
}
```

**Recommendation**: Add optional defense-in-depth checks in sensitive functions:

```javascript
if (req.user?.role !== "admin" && req.user?.role !== "post_holder") {
  return res.status(403).json({ error: "Unauthorized" });
}
```

---

## 10. RECOMMENDATIONS

### Immediate Actions

1. **Define Post Holder Scope**

   - Document what post_holders can/cannot do
   - Decide: Should post_holders manage event attendance?
   - Create decision matrix

2. **Standardize Middleware Usage**

   - Replace `isAdmin` with `requireAdmin` OR
   - Add new middleware: `requireAdminOrPostHolder` with clear naming
   - Add comments explaining the distinction

3. **Fix Post Position Storage**
   - Update `promoteStudent()` to save `post_position`
   - Test that position persists in database

### Medium-term

4. **Add Role Checks to Controllers**

   - Add defensive checks in critical functions
   - Follows security best practice (defense in depth)

5. **Frontend Implementation**

   - Create `AuthContext.jsx` to store user role
   - Create `api.js` with role-aware API calls
   - Add conditional rendering based on role

6. **Documentation**
   - Create RBAC.md documenting role hierarchy
   - Define what each role can do
   - Add comments to middleware explaining choices

### Long-term

7. **Consider Granular Permissions**
   - Current system: roles (admin, post_holder, member, student)
   - Could enhance: permissions (create_event, delete_user, etc.)
   - Implement: Permission checking in middleware

---

## 11. FILE REFERENCE SUMMARY

### Critical Files

- [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js) - Role checking
- [backend/middleware/adminMiddleware.js](backend/middleware/adminMiddleware.js) - Inconsistent with above
- [backend/models/authModel.js](backend/models/authModel.js) - Role storage
- [backend/utils/jwt.js](backend/utils/jwt.js) - Role encoding in tokens
- All [backend/routes/](backend/routes) - Route protection patterns
- [backend/controllers/adminController.js](backend/controllers/adminController.js) - Admin operations

### Missing/Incomplete

- ❌ `frontend/context/AuthContext.jsx` - Not implemented
- ❌ `frontend/services/api.js` - Not implemented
- ⚠️ `backend/models/authModel.js` - `post_position` not saved

---

## CONCLUSION

**Current State**: The RBAC system is **partially implemented** with:

- ✅ Clear role definitions (student → member/post_holder → admin)
- ✅ Role encoding in JWT tokens
- ✅ Middleware-based access control on most routes
- ❌ Inconsistent middleware (`requireAdmin` vs `isAdmin`)
- ❌ Post_holder responsibilities unclear
- ❌ Post_position field not persisted
- ❌ Frontend not implemented

**Risk Level**: **MEDIUM** - System blocks unauthorized access but lacks clarity on role boundaries and has gaps (post_holder restrictions, position field).

**Next Steps**: Clarify post_holder permissions, standardize middleware, fix position storage, and implement frontend.
