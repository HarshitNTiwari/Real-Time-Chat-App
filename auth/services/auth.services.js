import {db} from '../../utils/db.js'
import {hashToken} from '../utils/hashToken.js'

function addRefreshTokenToWhitelist({jti, refreshToken, userId}) {
    return db.refreshToken.create({
        data : {
            id: jti,
            hashedToken: hashToken(refreshToken),
            userId
        },
    });
}   

function findRefreshTokenById(id) {
    return db.refreshToken.findUnique({
        where: {
            id
        },
    });
}

function deleteRefreshToken(id) {
    return db.refreshToken.update({
        where: {
            id
        },
        data: {
            revoked: True
        },
    });
}

function revokeTokens(userId) {
    return db.refreshToken.updateMany({
        where: {
            userId
        },
        data: {
            revoked: True
        }
    });
}

export {addRefreshTokenToWhitelist, findRefreshTokenById, deleteRefreshToken, revokeTokens};