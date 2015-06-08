package qj.app.botwar.server.challenge.service;

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
            .embeded("battleSetup")
            .build();

    @Post
    public void createChallenge(Challenge challenge, Connection conn) {
        template.insert(challenge, conn);
    }

    @Get
    public List getAll(Connection conn) {
        return template.selectAll(conn);
    }
}

