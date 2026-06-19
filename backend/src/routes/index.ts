import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import uploadRouter from "./upload";
import productsRouter from "./products";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(uploadRouter);
router.use(productsRouter);

export default router;
