package qj.app.botwar.server.challenge.service;

import qj.app.botwar.server.challenge.model.Authen;
import qj.app.botwar.server.challenge.model.Challenge;
import qj.tool.sql.Builder;
import qj.tool.sql.Template;
import qj.tool.web.json.Get;
import qj.tool.web.json.Post;
import qj.tool.web.json.Url;

import java.sql.Connection;
import java.util.List;

/**
 * Created by quan on 6/7/2015.
 */
@Url("/challenges")
public class ChallengesService {
    public static Template<Challenge> template = new Builder<>(Challenge.class)
            .embeded("challengeSetup")
            .build();

    @Post
    public void createChallenge(Authen authen, Challenge challenge, Connection conn) {
        challenge.fromAuthenType = authen.type;
        challenge.fromId = authen.id;
        challenge.fromName = authen.username;
        challenge.fromEmail = authen.email;

        template.insert(challenge, conn);
    }

    @Get
    public List getAll(Connection conn) {
        List<Challenge> challenges = template.selectList(conn, "ORDER BY plusone DESC");
        challenges.forEach((c) -> {
            c.fromId = null;
        });
        return challenges;
    }
}

