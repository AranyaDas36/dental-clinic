declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: string;
        email: string;
        role: 'admin';
        mustChangePassword: boolean;
      };
      sessionToken?: string;
      csrfToken?: string;
    }
  }
}

export {};
