import { reactive } from "vue";

export type User = {
  id: string;
  username: string;
};

// Retrieve the stored user data from localStorage
const storedUser = localStorage.getItem("user");
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const store = reactive({
  user: initialUser as User | null,
  setUser(user: User | null) {
    this.user = user;
    // Save the user data to localStorage
    localStorage.setItem("user", JSON.stringify(user));
  },
});
