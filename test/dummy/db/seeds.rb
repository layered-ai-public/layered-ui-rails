users = [
  { name: "Alice Johnson", email: "alice@example.com" },
  { name: "Bob Smith", email: "bob@example.com" },
  { name: "Carol Williams", email: "carol@example.com" },
  { name: "David Brown", email: "david@example.com" },
  { name: "Eve Davis", email: "eve@example.com" },
  { name: "Frank Miller", email: "frank@example.com" },
  { name: "Grace Lee", email: "grace@example.com" },
  { name: "Henry Wilson", email: "henry@example.com" },
  { name: "Ivy Chen", email: "ivy@example.com" },
  { name: "Jack Taylor", email: "jack@example.com" },
  { name: "Karen White", email: "karen@example.com" },
  { name: "Leo Martinez", email: "leo@example.com" },
  { name: "Mia Anderson", email: "mia@example.com" },
  { name: "Noah Thomas", email: "noah@example.com" },
  { name: "Olivia Garcia", email: "olivia@example.com" },
  { name: "Paul Robinson", email: "paul@example.com" },
  { name: "Quinn Harris", email: "quinn@example.com" },
  { name: "Ruby Clark", email: "ruby@example.com" },
  { name: "Sam Lewis", email: "sam@example.com" },
  { name: "Tina Walker", email: "tina@example.com" },
  { name: "Uma Patel", email: "uma@example.com" },
  { name: "Victor Hall", email: "victor@example.com" },
  { name: "Wendy Young", email: "wendy@example.com" },
  { name: "Xavier King", email: "xavier@example.com" },
  { name: "Yara Scott", email: "yara@example.com" }
]

users.each do |attrs|
  User.find_or_create_by!(email: attrs[:email]) do |user|
    user.name = attrs[:name]
    user.password = SecureRandom.hex(12)
    user.confirmed_at = Time.current
  end
end

posts = [
  { title: "Getting started with Rails", body: "A beginner-friendly walkthrough covering generators, routing, and the MVC pattern. Perfect for developers coming from other frameworks." },
  { title: "Understanding Active Record", body: "Deep dive into associations, validations, and callbacks. Learn how the query interface translates Ruby methods into efficient SQL." },
  { title: "Turbo Frames in practice", body: "Replace page fragments without writing JavaScript. We build a live-updating dashboard using frames, streams, and morphing." },
  { title: "Stimulus controllers", body: "Lightweight controllers that attach behaviour to HTML. Covers targets, values, outlets, and the lifecycle callbacks." },
  { title: "Deploying to production", body: "From Kamal to Hatchbox, compare deployment strategies for Rails 8. Includes SSL, asset compilation, and health checks." },
  { title: "Testing best practices", body: "System tests, integration tests, and unit tests - when to use each. Covers fixtures, factories, and parallel test execution." },
  { title: "Background jobs with Solid Queue", body: "Process emails, image resizing, and report generation asynchronously. Solid Queue is the new default for Rails 8." },
  { title: "Authentication with Devise", body: "Set up registration, login, password recovery, and two-factor authentication. Covers OmniAuth for social logins." },
  { title: "Search with Ransack", body: "Build advanced search forms with sorting, filtering, and predicates. Integrates cleanly with Turbo Frames for live results." },
  { title: "Pagination with Pagy", body: "The fastest pagination gem for Ruby. Handles thousands of records with minimal memory usage and customisable UI." },
  { title: "CSS architecture patterns", body: "BEM naming, design tokens, and utility-first approaches. How to structure stylesheets that scale across large teams." },
  { title: "Importmap and modern JS", body: "Skip the bundler entirely. Importmap pins JavaScript modules directly from CDNs or vendored files. No node_modules needed." },
  { title: "Building APIs with Rails", body: "RESTful endpoints, JSON serialisation with jbuilder, and API versioning. Covers authentication tokens and rate limiting." },
  { title: "Action Cable and WebSockets", body: "Real-time features like chat, notifications, and presence indicators. Uses Redis or Solid Cable as the pub/sub backend." },
  { title: "Active Storage file uploads", body: "Attach images, documents, and videos to models. Supports direct uploads to S3, GCS, and Azure with variant processing." },
  { title: "Action Mailbox for inbound email", body: "Route incoming emails to mailbox classes for processing. Great for support ticket systems and reply-by-email workflows." },
  { title: "Hotwire and modern Rails", body: "The umbrella term for Turbo and Stimulus. Build reactive interfaces that feel like an SPA without the complexity." },
  { title: "Database optimisation techniques", body: "Indexing strategies, query analysis with EXPLAIN, and N+1 detection. Covers counter caches and database-level constraints." },
  { title: "Rails security best practices", body: "Protect against XSS, CSRF, SQL injection, and mass assignment. Covers Content Security Policy headers and encrypted credentials." },
  { title: "Internationalisation with I18n", body: "Translate your app into multiple languages. Covers locale files, pluralisation rules, and date/currency formatting." },
  { title: "Multi-tenancy patterns", body: "Row-level scoping, schema-per-tenant, and database-per-tenant approaches. Trade-offs between isolation and operational complexity." },
  { title: "Service objects in Rails", body: "Extract complex business logic from controllers and models. When a PORO is better than a concern or callback." },
  { title: "ViewComponent for reusable UI", body: "Encapsulate view logic into testable Ruby objects. Slots, previews, and integration with Tailwind and Stimulus." },
  { title: "Tailwind CSS with Rails", body: "Utility-first CSS integrated via tailwindcss-rails. Covers configuration, custom themes, dark mode, and responsive design." },
  { title: "Rails and Docker", body: "Containerise your app for consistent development and deployment. Multi-stage builds, docker-compose, and volume management." },
  { title: "CI/CD pipelines for Rails", body: "Automate tests, linting, and deployments with GitHub Actions. Covers parallel test splitting and caching strategies." },
  { title: "Monitoring and observability", body: "Instrument your app with structured logging, error tracking, and performance metrics. Covers OpenTelemetry and Sentry." },
  { title: "GraphQL with Rails", body: "Schema-first API design using graphql-ruby. Covers queries, mutations, subscriptions, and dataloader for batching." },
  { title: "Event sourcing patterns", body: "Store every state change as an immutable event. Rebuild projections, enable audit trails, and simplify debugging." },
  { title: "Rails upgrade strategies", body: "Move between major versions safely. Dual-boot testing, deprecation warnings, and gem compatibility matrices." }
]

all_users = User.all.to_a
posts.each_with_index do |attrs, i|
  Post.find_or_create_by!(title: attrs[:title]) do |post|
    post.body = attrs[:body]
    post.user = all_users[i % all_users.size]
  end
end
