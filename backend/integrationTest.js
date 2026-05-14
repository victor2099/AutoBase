const url = 'http://localhost:3000/api';

(async () => {
  try {
    const email = `testuser${Date.now()}@example.com`;
    const registerResponse = await fetch(`${url}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email,
        password: 'Password1!',
        confirmPassword: 'Password1!',
      }),
    });
    const registerData = await registerResponse.json();
    console.log('REGISTER', registerResponse.status, registerData);

    const loginResponse = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'Password1!',
      }),
    });
    const loginData = await loginResponse.json();
    console.log('LOGIN', loginResponse.status, loginData);

    const carsResponse = await fetch(`${url}/cars`);
    const carsData = await carsResponse.json();
    console.log('CARS', carsResponse.status, carsData);

    if (loginResponse.ok) {
      const bookingsResponse = await fetch(`${url}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      const bookingsData = await bookingsResponse.json();
      console.log('MY_BOOKINGS', bookingsResponse.status, bookingsData);
    }
  } catch (error) {
    console.error('ERROR', error);
    process.exit(1);
  }
})();
