import { reactive } from "vue";

export type User = {
  id: string;
  username: string;
};

export const store = reactive({
  user: null as User | null,
  setUser(user: User | null) {
    console.log("setting user", user);
    this.user = user;
  },
});
