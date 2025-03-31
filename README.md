# Builder-Central

A modern platform for showcasing and discovering developer tools. Built with Next.js, React, and MongoDB.

## Features

- User Authentication & Authorization
- Tool Publishing and Management
- Tool Discovery and Interaction
- Social & Community Features
- Modern UI with ShadCN Components
- Responsive Design

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: ShadCN
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Custom JWT-based auth

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/builder-central.git
cd builder-central
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   └── ui/          # ShadCN UI components
├── lib/             # Utility libraries
├── models/          # MongoDB models
├── types/           # TypeScript types
├── utils/           # Helper functions
└── hooks/           # Custom React hooks
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
