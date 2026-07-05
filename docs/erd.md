# Forge — Database ERD

```mermaid
erDiagram
    Dealership ||--o{ User : has
    Dealership ||--o{ Customer : has
    Dealership ||--o{ Deal : has
    Dealership ||--o{ InventoryUnit : has
    Dealership ||--o{ Event : has
    Dealership ||--o{ Task : has

    User ||--o{ Customer : assigned
    User ||--o{ Deal : owns
    User ||--o{ Task : assigned
    User ||--|| UserStats : has

    Customer ||--o{ Interaction : timeline
    Customer ||--o{ Note : notes
    Customer ||--o{ Deal : deals
    Customer ||--o{ VoiceNote : voice
    Customer ||--o| CustomerAiInsight : insights
    Customer ||--o{ DealBrief : briefs
    Customer }o--o{ Tag : tagged

    Deal }o--|| InventoryUnit : for
    FollowUpSequence ||--o{ FollowUpStep : steps
    FollowUpSequence ||--o{ FollowUpEnrollment : enrollments
    Event ||--o{ EventRegistration : registrations
```

## Core Indexes

- `customers(dealershipId, deletedAt)` + trigram on name/email/phone
- `inventory_units(dealershipId, status, make, model)`
- `deals(dealershipId, stage)`
- `notes.embedding` — pgvector HNSW index
- `tasks(dealershipId, assignedToId, status, dueAt)`
