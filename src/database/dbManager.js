import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { db, ObjectId } from "./mongodb.js";

const DAYS_10 = 60 * 60 * 24 * 10;

export async function findUser(query) {
  const user = await db.collection("users").findOne(query);
  return user;
}

export async function createUser(user) {
  const newUser = { ...user };
  delete newUser.confirmation;

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(user.password, salt);

  newUser.password = hashedPassword;

  await db.collection("users").insertOne(newUser);
}

export async function updateUser(oldUser, newInfo) {
  const queryResult = await db.collection("users").updateOne({ email: oldUser.email }, { $set: { ...newInfo } });
  return queryResult;
}

export async function createSession(userId) {
  const secret = process.env.JWT_SECRET;
  const exp = Date.now() / 1000 + DAYS_10;
  const token = jwt.sign({ userId, exp }, secret);
  const newSession = {
    userId,
    token,
  };

  await db.collection("sessions").insertOne(newSession);
  return token;
}

export async function findSession(token) {
  const user = await db.collection("sessions").findOne({ token });
  return user;
}

export async function findCards(user) {
  const cards = await db.collection("cards").find({ userId: user._id }).toArray();
  return cards;
}

export async function createCard(user, card) {
  await db.collection("cards").insertOne({ ...card, userId: user._id, date: dayjs().format("DD/MM/YYYY HH:mm") });
}

export async function findCard(id, user) {
  const card = await db.collection("cards").findOne({ _id: new ObjectId(id), userId: user._id });
  return card;
}

export async function deleteOneCard(card) {
  await db.collection("cards").deleteOne(card);
}

export async function cardAlreadyExist(userId, cardNumber) {
  const card = await db.collection("cards").findOne({ userId, cardNumber });
  return card;
}

export async function createProduct(product) {
  const productId = await db.collection("products").insertOne(product);
  return productId;
}

export async function findProductById(productId) {
  const product = await db.collection("products").findOne({ _id: ObjectId(productId) });
  return product;
}

export async function listProducts() {
  const products = await db.collection("products").find().toArray();
  return products;
}

export async function createOrder(user, order) {
  await db.collection("orders").insertOne({ ...order, userId: user._id, date: dayjs().format("DD/MM/YYYY HH:mm") });
}

export async function findOrder(user, order) {
  const orderFinded = db.collection("orders").findOne({ ...order, userId: user._id });
  return orderFinded;
}
