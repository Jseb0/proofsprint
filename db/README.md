# Database Layer

This folder contains version-controlled SQL schema and migrations.

## Structure

- migrations/ → Ordered migration files
- seed.sql → Development seed data

## Migration Order

1. 001_initial_schema.sql
2. 002_rls_policies.sql
3. 003_functions.sql

These files represent the production database structure.