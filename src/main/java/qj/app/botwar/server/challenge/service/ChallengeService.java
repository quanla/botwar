package qj.app.botwar.server.challenge.service;

import qj.app.botwar.server.AuthorizationException;
import qj.app.botwar.server.challenge.model.Authen;
import qj.app.botwar.server.challenge.model.Challenge;
import qj.tool.sql.Builder;
import qj.tool.sql.SQLUtil;
import qj.tool.sql.Template;
import qj.tool.web.json.*;

import java.sql.Connection;
import java.util.Objects;

import static qj.app.botwar.server.challenge.service.ChallengesService.template;

/**
 * Created by quan on 6/7/2015.
 */
@Url("/challenge/:challengeId")
public class ChallengeService {
    @Get
    public Challenge get(@UrlParam("challengeId") Long challengeId, Connection conn) {
        return template.selectById(challengeId, conn);
    }

    @Delete
    public void delete(@UrlParam("challengeId") Long challengeId, Authen authen, Connection conn) {
        Challenge challenge = template.selectById(challengeId, conn);
        if (
                Objects.equals(challenge.fromAuthenType, authen.type)
                && Objects.equals(challenge.fromId, authen.id)
        ) {
            template.deleteById(challengeId, conn);
        } else {
            throw new AuthorizationException();
        }
    }

    @Put
    @Url("/challenge/:challengeId/plusone/:state")
    public int plusone(@UrlParam("challengeId") Long challengeId, @UrlParam("state") String state, Connection conn) {
        Challenge challenge = template.select(conn, "SELECT id, plusone WHERE id=?", challengeId);
        challenge.plusone += "on".equals(state) ? 1 : -1;
        template.update(challenge, "plusone", conn);
        return challenge.plusone;
    }


//    public static Template<Challenge> template = new Builder<>(Challenge.class)
//            .embeded("challengeSetup")
//            .build();

    @Get
    @Url("/challenge/:challengeId/count_replies")
    public Long countReplies(@UrlParam("challengeId") Long challengeId, Connection conn) {
        return SQLUtil.selectLong(conn, "SELECT count(*) FROM challenge_reply WHERE challenge_reply.to_challenge = ?", challengeId);
    }
}

