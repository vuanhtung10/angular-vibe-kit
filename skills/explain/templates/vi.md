# Templates Tiếng Việt — Giải thích code Angular (project-agnostic)

> Đây là **khung cấu trúc**, không gắn với dự án cụ thể. Điền mọi `{{...}}` bằng thông tin đọc được
> từ code thật của dự án (version, UI library, state approach, HTTP/service pattern, interceptors...).
> KHÔNG giả định PrimeNG/Material, NgRx/Signals, hay BaseService — lấy từ `docs/ARCHITECTURE.md`,
> `docs/DESIGN_SYSTEM.md`, `.claude/rules/project-rules.md` và code.

## Giải thích Code

```markdown
## 📁 File: {filename}

### Mục đích
[1-2 câu: component/service này dùng để làm gì trong hệ thống]

### Phân tích

**Decorator / Metadata**
- `@Component`: selector, templateUrl, styleUrls, `changeDetection` (nếu có)
  - Standalone hay khai báo trong NgModule? → theo đúng cách dự án dùng ({{standalone|NgModule}})
- `@Injectable`: `providedIn: 'root'` hay scoped

**Module / Feature Context** *(nếu có)*
- Thuộc feature/module: [tên — theo Folder Structure trong project-rules.md]
- Lazy-loaded: [có/không, qua route nào]
- Route path: [nếu có]

**Inputs / Outputs** *(nếu có)*
- `@Input()` / `input()`: [ý nghĩa, kiểu, ai truyền vào]
- `@Output()` / `output()`: [event gì, emit khi nào, payload]

**Dependencies (DI)**
- [Liệt kê service/token được inject — theo đúng pattern DI dự án dùng: `inject()` hay constructor]
- [Nếu dự án có base-service/abstraction dùng chung → nêu tên thật đọc từ code, không giả định]

**Properties chính**
- `propertyX: Type`: [vai trò, khởi tạo]

**Lifecycle Hooks**
- `ngOnInit()` / `ngOnDestroy()` / khác: [làm gì; teardown subscription thế nào]

**Methods quan trọng**
- [Tên method → nhiệm vụ, luồng xử lý]

**Form Handling** *(nếu có)*
- [Reactive/Template-driven — theo dự án; validators; luồng submit]

**UI Components** *(nếu có)*
- [Component của {{UI library dự án đang dùng}} hoặc wrapper trong shared/ — đọc từ DESIGN_SYSTEM.md]

**State Management** *(nếu có)*
- [Cách quản lý state THẬT của dự án: {{Signals | NgRx | BehaviorSubject | service}} — không giả định]

### 💡 Điểm cần nhớ
- [Key point về business logic / technical / edge cases]

### 🔗 Liên kết
- **Gọi service**: [service + methods]
- **Được dùng bởi**: [parent component / route]
- **Related files**: [model, service, routing]
```

---

## Giải thích Concept

```markdown
## 🎯 {Tên Concept}

### Là gì?
[2-3 câu giải thích đơn giản]

### Ví dụ đời thường
[So sánh với thứ quen thuộc để dễ hiểu]

### Trong dự án này
**Vị trí**: `[đường dẫn file thật]`
```typescript
// Ví dụ code THẬT trích từ dự án (không bịa)
```
**Cách dùng**:
```typescript
// Ví dụ sử dụng trong component/service của dự án
```

### Tại sao dùng?
- **Lý do 1..n**: [giải thích]

### Không dùng thì sao?
- ❌ [Vấn đề sẽ gặp]

### So sánh với cách khác
| Cách này | Cách khác | Khi nào dùng |
|----------|-----------|--------------|
| … | … | … |

### 📚 Tìm hiểu thêm
- Angular docs / docs của {{UI library / state library dự án dùng}} / related concepts
```

---

## Giải thích Flow

```markdown
## 🔄 Flow: {Tên tính năng}

### Tổng quan
[1-2 câu: flow từ đâu đến đâu]

### Sơ đồ
```
[User thao tác]
    │
    ▼
[Component] ──── bắt event, validate (nếu có), gọi service
    │
    ▼
[Service / lớp gọi API của dự án] ── chuẩn bị payload, gọi HTTP
    │
    ▼
[HTTP Interceptor chain của dự án] ── {{liệt kê interceptor THẬT: auth, error, loading...}}
    │
    ▼
[Backend API]
    │
    ▼
[Response] ──► [Service] ──► [Component] ── handle success/error
    │
    ▼
[Template re-render]
```

### Chi tiết từng bước
**Bước 1: User thao tác** — [event handler]
**Bước 2: Component xử lý** — [validate, gọi service]
```typescript
// code thật/minh họa theo dự án
```
**Bước 3: Service gọi API** — [method, endpoint]
**Bước 4: Interceptors** — [đọc từ ARCHITECTURE.md: những interceptor dự án thực sự có]
**Bước 5: Nhận response** — [success/error handling]
**Bước 6: UI update** — [change detection / component cập nhật]

### 🔍 Mẹo debug
- Network tab: URL/headers/payload/status đúng không?
- Console: lỗi từ interceptor? token? validation?
- Environment/config: đọc từ nơi dự án lưu config (theo ARCHITECTURE.md)

### Common issues
- ❌ [liệt kê theo pattern thật của dự án]
```

---

## Giải thích Why

```markdown
## ❓ Tại sao: {Câu hỏi}

### Trả lời ngắn
[1-2 câu trả lời trực tiếp]

### Giải thích chi tiết
- **Lý do 1..n**: [giải thích + ví dụ code nếu cần]

### Nếu không làm vậy?
- ❌ [Vấn đề + impact + mức độ]

### Đánh đổi (Trade-offs)
| Ưu điểm ✅ | Nhược điểm ❌ |
|-----------|--------------|
| … | … |

### Có cách khác không?
- **Cách 1..n**: [mô tả, khi nào dùng]

### Context trong dự án này
- [Đọc `docs/decisions/` (ADR) nếu có; nếu không, nêu rõ là suy luận từ code]

### 📌 Kết luận
**TL;DR**: [2-3 câu]
**Key takeaways**: 💡 [điểm quan trọng]
```
