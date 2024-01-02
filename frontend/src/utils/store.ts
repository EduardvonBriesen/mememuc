import { reactive } from "vue";

export type User = {
  id: string;
  username: string;
};

const storedUser = sessionStorage.getItem("user");
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const store = reactive({
  user: initialUser as User | null,
  setUser(user: User | null) {
    this.user = user;
    sessionStorage.setItem("user", JSON.stringify(user));
  },
});
