import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Storage Box (Context)
const AuthContext = createContext();

// 2. The Provider Component (The Wrapper)
export function AuthProvider({ children }) {//export: Allows other files (like main.jsx) to use this component.
//AuthProvider: The name of our component.
//({ children }): This is a React trick. It means "whatever is inside these tags." Since we wrap our whole app in AuthProvider, the "children" is your entire website.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This runs ONCE when the app starts
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. A custom "Hook" to make it easy to use this context
export function useAuth() {
  return useContext(AuthContext);
}

/*

1. The Water Tank (The Code: AuthContext)
The Context is like a big Water Tank at the top of your building. This tank holds everything: "User names," "Login buttons," etc.

2. The Pipes (The Code: <AuthContext.Provider>)
The Provider is the system of pipes. When we wrap our app in the Provider, it’s like connecting every single room (every page) in the building to that big Water Tank.

The value is the water inside the pipes (your data).
The {children} are the actual rooms (your pages like Dashboard or Login).
Result: Every room now has access to the water!
useAuth is the Tap.
Whenever you want to know "Who is the user?" you just turn on the tap (const { user } = useAuth()) and the information flows right to yo

*/
