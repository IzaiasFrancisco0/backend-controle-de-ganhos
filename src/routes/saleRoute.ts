import { Router } from 'express';
import { saleController } from '../controllers/saleController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, saleController.create);
router.get('/', authMiddleware, saleController.list);


router.get('/dashboard', authMiddleware, saleController.dashboard);
router.put('/:id', authMiddleware, saleController.update);
router.delete('/:id', authMiddleware, saleController.delete);

export default router;