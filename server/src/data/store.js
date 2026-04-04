import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.resolve(process.cwd(), "server", "data");
const dataFilePath = path.join(dataDirectory, "app-data.json");

const defaultState = {
  users: [],
  orders: [],
  appointments: [],
};

const ensureStore = async () => {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify(defaultState, null, 2), "utf8");
  }
};

const readState = async () => {
  await ensureStore();
  const raw = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(raw);
};

const writeState = async (state) => {
  await ensureStore();
  await fs.writeFile(dataFilePath, JSON.stringify(state, null, 2), "utf8");
};

const withCollection = async (collectionName, updater) => {
  const state = await readState();
  const result = await updater(state[collectionName], state);
  await writeState(state);
  return result;
};

export const store = {
  async findUserByEmail(email) {
    const state = await readState();
    return state.users.find((user) => user.email === String(email).toLowerCase()) || null;
  },

  async findUserById(id) {
    const state = await readState();
    return state.users.find((user) => user._id === String(id)) || null;
  },

  async createUser({ name, email, phone, passwordHash }) {
    return withCollection("users", async (users) => {
      const user = {
        _id: crypto.randomUUID(),
        name,
        email: String(email).toLowerCase(),
        phone,
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(user);
      return user;
    });
  },

  async listOrdersByUser(userId) {
    const state = await readState();
    return state.orders
      .filter((order) => order.user === String(userId))
      .sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
  },

  async createOrder(orderInput) {
    return withCollection("orders", async (orders) => {
      const now = new Date().toISOString();
      const order = {
        _id: crypto.randomUUID(),
        ...orderInput,
        orderedAt: orderInput.orderedAt || now,
        createdAt: now,
        updatedAt: now,
      };

      orders.push(order);
      return order;
    });
  },

  async listAppointmentsByUser(userId) {
    const state = await readState();
    return state.appointments
      .filter((appointment) => appointment.user === String(userId))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  async createAppointment(appointmentInput) {
    return withCollection("appointments", async (appointments) => {
      const now = new Date().toISOString();
      const appointment = {
        _id: crypto.randomUUID(),
        ...appointmentInput,
        bookedAt: appointmentInput.bookedAt || now,
        canceledAt: appointmentInput.canceledAt || null,
        createdAt: now,
        updatedAt: now,
      };

      appointments.push(appointment);
      return appointment;
    });
  },

  async findAppointmentByIdForUser(appointmentId, userId) {
    const state = await readState();
    return (
      state.appointments.find(
        (appointment) => appointment._id === String(appointmentId) && appointment.user === String(userId)
      ) || null
    );
  },

  async updateAppointment(appointmentId, updater) {
    return withCollection("appointments", async (appointments) => {
      const index = appointments.findIndex((appointment) => appointment._id === String(appointmentId));
      if (index === -1) return null;

      const currentAppointment = appointments[index];
      const updatedAppointment = {
        ...currentAppointment,
        ...updater(currentAppointment),
        updatedAt: new Date().toISOString(),
      };

      appointments[index] = updatedAppointment;
      return updatedAppointment;
    });
  },
};
