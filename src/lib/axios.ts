import axios from "axios";
import { CLIENT_API_BASE } from "@/lib/client-api";

export const api = axios.create({
  baseURL: CLIENT_API_BASE,
});
