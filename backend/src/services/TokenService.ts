import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { UserDAO } from '../dao/UserDAO.js';

export class TokenService{
    private userDAO = new UserDAO();

    async spendToken(user_id: number){
        const t = await DatabaseConnection.getInstance().transaction();
        try{
            const result = await this.userDAO.decrToken(user_id, t);
            console.log(result);
            if(!result){
                await t.rollback();
                throw ErrorFactory.getError(AppErrorEnum.TOKEN_SPEND_ERROR);
            }
            await t.commit();
            return result;
        } catch (err){
            
      if (err instanceof AppError) { 
        throw err;
      }
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
        
    }

}