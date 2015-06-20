package qj.app.botwar.server.challenge.service;

import qj.app.botwar.server.AuthorizationException;
import qj.app.botwar.server.challenge.model.Authen;
import qj.app.botwar.server.challenge.model.Challenge;
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
    @Url("/challenge/plusone/:challengeId/:state")
    public void plusone(@UrlParam("challengeId") Long challengeId, @UrlParam("state") String state, Connection conn) {
        if ("on".equals(state)) {
            template.update(conn, "SET plusone = plusone + 1 WHERE id=?", challengeId);
        } else {
            template.update(conn, "SET plusone = plusone - 1 WHERE id=?", challengeId);
        }
    }
}

