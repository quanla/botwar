package qj.app.botwar.server.challenge.action;

import qj.app.botwar.server.challenge.Post;
import qj.app.botwar.server.challenge.Url;
import qj.app.botwar.server.challenge.model.Challenge;
import qj.tool.sql.Builder;
import qj.tool.sql.Template;

import java.sql.Connection;

/**
 * Created by quan on 6/7/2015.
 */
@Url("/challenge")
@Post
public class CreateChallenge {
    static Template template = new Builder(Challenge.class)
            .embeded("battleSetup")
            .build();

    public void exec(Challenge challenge, Connection conn) {
        template.insert(challenge, conn);
//        System.out.println(challenge);
    }
}

