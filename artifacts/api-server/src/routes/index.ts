import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studioRouter from "./studio";
import emailPreferencesRouter from "./email-preferences";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studioRouter);
router.use(emailPreferencesRouter);

export default router;
