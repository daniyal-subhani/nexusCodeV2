# NexusCore V2

> Event-driven microservices platform built with TypeScript, RabbitMQ, Docker, and relational databases.

NexusCore V2 is a production-oriented backend architecture project focused on authentication, service isolation, asynchronous communication, and scalable infrastructure.

The implementation repository is private, while this repository documents the system architecture, service boundaries, messaging patterns, and engineering decisions.

---

## Architecture

```text
                         ┌───────────────┐
                         │    Client     │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ API Gateway   │
                         └───────┬───────┘
                                 │
             ┌───────────────────┼──────────────────┐
             │                   │                  │
             ▼                   ▼                  ▼
       ┌──────────┐        ┌──────────┐       ┌──────────┐
       │   Auth   │        │   User   │       │   Chat   │
       │ Service  │        │ Service  │       │ Service  │
       └────┬─────┘        └────┬─────┘       └────┬─────┘
            │                   │                  │
            │                   │                  │
            └───────────────────┼──────────────────┘
                                │
                                ▼
                         ┌───────────────┐
                         │   RabbitMQ    │
                         │ Event Broker  │
                         └───────────────┘
```

---

## Core Concepts

* Microservice boundaries
* Event-driven communication
* RabbitMQ topic exchange
* Publisher / consumer abstractions
* Authentication and token lifecycle management
* Database-per-service architecture
* Repository / service / controller layering
* Graceful service startup
* Dockerized infrastructure
* Shared infrastructure through internal packages

---

## Event Flow

Example: user registration

```text
                         Auth Service
                              │
                              │ Create User
                              ▼
                        ┌─────────────┐
                        │  Auth DB    │
                        └──────┬──────┘
                               │
                               │ user.created
                               ▼
                        ┌─────────────┐
                        │  RabbitMQ   │
                        └──────┬──────┘
                               │
                               │ Consume
                               ▼
                        ┌─────────────┐
                        │ User Service│
                        └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  User DB    │
                        └─────────────┘
```

The Auth Service owns authentication and identity creation, while the User Service owns user-domain data. RabbitMQ provides asynchronous communication between the services without requiring direct database access between them.

---

## Service Boundaries

| Service      | Responsibility                                              |
| ------------ | ----------------------------------------------------------- |
| Auth Service | Authentication, authorization, credentials, token lifecycle |
| User Service | User profile and user-domain data                           |
| API Gateway  | External API entry point and request routing                |
| Chat Service | Real-time communication and messaging                       |

Each service is designed around a clear responsibility and independent data ownership.

---

## Technology Stack

| Area             | Technology                   |
| ---------------- | ---------------------------- |
| Runtime          | Node.js                      |
| Language         | TypeScript                   |
| API Framework    | Express                      |
| Messaging        | RabbitMQ                     |
| ORM              | Drizzle                      |
| Database         | MySQL                        |
| Containerization | Docker                       |
| Package Manager  | pnpm                         |
| Code Quality     | ESLint, Prettier, TypeScript |
| Git Hooks        | Husky, lint-staged           |

---

## Backend Architecture

Individual services follow a layered architecture:

```text
                    HTTP Request
                         │
                         ▼
                    ┌─────────┐
                    │  Route  │
                    └────┬────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ Controller  │
                  └──────┬──────┘
                         │
                         ▼
                   ┌─────────┐
                   │ Service │
                   └────┬────┘
                        │
                        ▼
                 ┌────────────┐
                 │ Repository │
                 └──────┬─────┘
                        │
                        ▼
                    ┌──────┐
                    │  DB  │
                    └──────┘
```

This separation keeps HTTP concerns, business logic, persistence, and infrastructure concerns isolated.

---

## RabbitMQ Architecture

NexusCore V2 uses RabbitMQ for asynchronous service-to-service communication.

```text
┌──────────────┐
│ Auth Service │
└──────┬───────┘
       │
       │ publish
       │ user.created
       ▼
┌─────────────────────┐
│   nexus.events      │
│    Topic Exchange   │
└──────────┬──────────┘
           │
           │ routing key:
           │ user.created
           ▼
┌─────────────────────┐
│ user-service queue  │
└──────────┬──────────┘
           │
           ▼
┌──────────────┐
│ User Service │
└──────────────┘
```

RabbitMQ infrastructure is centralized in the shared `@nexus/common` package.

The shared package handles infrastructure concerns such as:

* RabbitMQ connections
* Channels
* Exchanges
* Queues
* Bindings
* Publishers
* Consumers
* Message serialization
* Message acknowledgements

Individual services remain responsible for their own domain events and handlers.

---

## Shared Infrastructure

```text
@nexus/common
│
└── RabbitMQ
    ├── Connection
    ├── Channels
    ├── Publisher
    ├── Consumer
    └── Topology
```

For example:

```text
Auth Service
    │
    └── publishUserCreated()
             │
             ▼
       @nexus/common
             │
             ▼
          RabbitMQ
```

The shared package provides reusable infrastructure without coupling services to each other's business logic.

---

## Authentication

The authentication system is designed around short-lived access tokens and rotating refresh tokens.

Core concepts include:

* Access token generation
* Refresh token rotation
* Refresh token hashing
* Token expiration
* Token revocation
* Refresh-token family tracking
* Token reuse detection
* Password reset workflows
* Email verification workflows

Example refresh-token lifecycle:

```text
Client
  │
  │ Refresh Token
  ▼
Auth Service
  │
  ├── Hash token
  │
  ├── Find token record
  │
  ├── Check expiration
  │
  ├── Check revocation
  │
  ├── Detect token reuse
  │
  └── Rotate token
        │
        ├── New Access Token
        │
        └── New Refresh Token
```

---

## Scheduled Jobs

Auth Service includes scheduled maintenance jobs for authentication-related data.

```text
Cron Scheduler
      │
      ├── Refresh token cleanup
      │
      ├── Password reset token cleanup
      │
      ├── Email verification cleanup
      │
      └── Periodic health logging
```

These jobs are registered during service startup and operate independently from HTTP request handling.

---

## Engineering Principles

NexusCore V2 is built around several architectural principles:

### Service Ownership

Each microservice owns its domain logic and persistence.

### Loose Coupling

Services communicate through APIs and asynchronous events rather than accessing another service's database directly.

### Separation of Concerns

HTTP, business logic, persistence, messaging, and infrastructure responsibilities remain separated.

### Explicit Startup

Infrastructure that requires initialization is started during application bootstrap.

### Reusable Infrastructure

Cross-service infrastructure is centralized in shared packages while business-specific logic remains inside individual services.

---

## Project Goals

NexusCore V2 is being developed to explore and implement:

* Distributed backend architecture
* Event-driven systems
* Microservice communication
* Authentication infrastructure
* Data ownership
* Message reliability
* Service scalability
* Infrastructure automation
* Production-oriented engineering practices

---

## Repository Structure

High-level monorepo structure:

```text
nexus-core-v2/
│
├── packages/
│   └── common/
│
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── gateway-service/
│   └── chat-service/
│
├── docker/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Source Code

The production implementation of NexusCore V2 is maintained in a private repository.

This public repository contains:

* System architecture
* Technical documentation
* Architecture diagrams
* Service boundaries
* Messaging patterns
* Engineering decisions
* Selected implementation concepts

Private source code can be made available for technical review where appropriate.

---

## Status

🚧 **Active Development**

NexusCore V2 is an evolving architecture project. New services, infrastructure components, reliability mechanisms, and engineering documentation are being added incrementally.

---

## Author

**Daniyal Subhani**

Full-Stack JavaScript / TypeScript Engineer

* GitHub: [daniyal-subhani](https://github.com/daniyal-subhani)
* LinkedIn: [daniyal-codes](https://www.linkedin.com/in/daniyal-codes/)
