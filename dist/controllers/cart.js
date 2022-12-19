"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cart_1 = __importDefault(require("../models/Cart"));
const database_1 = __importDefault(require("../utils/database"));
const postAddProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const findedCart = yield Cart_1.default.findOne({
            where: {
                UserId: req.userId,
            },
        });
        if (!findedCart) {
            const [cartId, meta] = yield database_1.default.query("INSERT INTO carts(UserId) VALUES(:UserId)", {
                replacements: {
                    UserId: req.userId,
                },
            });
            yield database_1.default.query("INSERT INTO cartitems(ProductId, CartId) VALUES(:ProductId, :CartId)", {
                replacements: {
                    ProductId: req.body.id,
                    CartId: cartId,
                },
            });
        }
        else {
        }
    }
    catch (err) {
        next(err);
    }
});
exports.default = { postAddProduct };
