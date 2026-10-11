export type Credentials = { username: string; password: string };

export const generateRandomUser = (prefix = 'tech99'): Credentials => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return {
    username: `${prefix}_${timestamp}_${random}`,
    password: `Pw_${random}!`
  };
};

export const invalidUsers = {
  nonExistingUser: {
    username: `ghost_${Date.now()}`,
    password: '123456'
  },
  sqlInjection: {
    username: `' OR '1'='1`,
    password: `' OR '1'='1`
  },
};

export const productsByCategory = {
  Phones: {
    id: 3,
    productName: 'Nexus 6',
    price: 650
  },
  Laptops: {
    id: 8,
    productName: 'Sony vaio i5',
    price: 790
  },
  Monitors: {
    id: 10,
    productName: 'Apple monitor 24',
    price: 400
  },
} as const;

export type CategoryType = keyof typeof productsByCategory;

export type CustomerInformation = {
  name: string;
  country: string;
  city: string;
  creditCard: string;
  month: string;
  year: string;
};

export const customers: Record<'valid' | 'empty' | 'nameOnly' | 'cardOnly', CustomerInformation> = {
  valid: {
    name: 'Tech99 Tester',
    country: 'Vietnam',
    city: 'Ho Chi Minh',
    creditCard: '4111111111111111',
    month: '12',
    year: '2030',
  },
  empty: { name: '', country: '', city: '', creditCard: '', month: '', year: '' },
  nameOnly: { name: 'Tech99 Tester', country: '', city: '', creditCard: '', month: '', year: '' },
  cardOnly: { name: '', country: '', city: '', creditCard: '4111111111111111', month: '', year: '' },
};

export const messages = {
  productAdded: 'Product added',
  signUpSuccessful: 'Sign up successful.',
  userAlreadyExists: 'This user already exist.',
  wrongPassword: 'Wrong password.',
  userNotExist: 'User does not exist.',
  fillUsernameAndPassword: 'Please fill out Username and Password.',
  fillNameAndCard: 'Please fill out Name and Creditcard.',
  purchaseSuccessful: 'Thank you for your purchase!',
};
