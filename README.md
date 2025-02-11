# Open Letter Platform

A Next.js application for creating and managing open letter campaigns with signature collection and verification.

## Features

- 📝 Customizable open letter content
- ✅ Email verification for signatures
- 🔍 Real-time search through verified signatures
- 📊 Notable signatory highlighting
- 🛡️ Rate limiting and spam protection
- 🎨 Responsive design with Tailwind CSS
- 🔒 PostgreSQL database for secure data storage

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Getting Started

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd open-letter
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Set up the database**

Create your PostgreSQL database and run the schema:

```bash
psql -d your_database_name -f schema.sql
```

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## API Endpoints

### GET /api/signatures
- Retrieves all verified signatures
- Optional search parameter

### POST /api/signatures
- Creates a new signature
- Sends verification email
- Rate limited to prevent abuse

### PUT /api/signatures
- Verifies a signature using email token

## Database Schema

```sql
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    position VARCHAR(255),
    honors VARCHAR(255),
    is_notable BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);
```

## Development

- Built with Next.js 13+ App Router
- Uses TypeScript for type safety
- Styled with Tailwind CSS
- UI components from shadcn/ui
- PostgreSQL with node-postgres

## Production Deployment

1. Update `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` for your production environment
2. Build the application:

```bash
npm run build
# or
yarn build
```

3. Start the production server:

```bash
npm start
# or
yarn start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[Your chosen license]