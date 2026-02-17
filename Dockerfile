# syntax=docker/dockerfile:1
# check=error=true

# Dockerfile for deploying the test/dummy Rails app via Kamal 2.
# Build context must be the repo root (builder.context: "../.." in deploy.yml).

ARG RUBY_VERSION=3.3
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

WORKDIR /rails

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libsqlite3-0 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    RAILS_GROUPS="development,test"

# ---------- build stage ----------
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install all gem groups - development deps (puma, devise, tailwindcss-rails…)
# are runtime requirements for the dummy app.
COPY Gemfile Gemfile.lock layered-ui-rails.gemspec ./
COPY lib/layered/ui/version.rb lib/layered/ui/version.rb
ENV BUNDLE_WITHOUT=""
RUN bundle install && \
    rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Copy the entire repo (engine + dummy app)
COPY . .

# Precompile assets (Tailwind CSS is built automatically via Propshaft)
RUN cd test/dummy && \
    SECRET_KEY_BASE_DUMMY=1 bin/rails assets:precompile

# ---------- runtime stage ----------
FROM base

COPY --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build /rails /rails

WORKDIR /rails/test/dummy

RUN useradd rails --create-home --shell /bin/bash && \
    mkdir -p /rails/test/dummy/db \
             /rails/test/dummy/log \
             /rails/test/dummy/storage \
             /rails/test/dummy/tmp && \
    chown -R rails:rails /rails/test/dummy/db \
                         /rails/test/dummy/log \
                         /rails/test/dummy/storage \
                         /rails/test/dummy/tmp

USER rails:rails

ENTRYPOINT ["bin/docker-entrypoint"]

EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
