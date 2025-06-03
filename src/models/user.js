const getDefaultUserData = (overrides = {}) => {
  return {
    email: null,
    username: null,
    password: null,
    createdAt: new Date(),
    avatar: null,
    fullName: null,
    location: null,
    status: null,
    updatedAt: null,
    description: null,
    position: null,
    background: null,
    ...overrides,
  };
};

module.exports = { getDefaultUserData };