package qj.app.botwar.server.challenge.service;

import qj.app.botwar.server.challenge.model.Challenge;
import qj.tool.sql.Builder;
import qj.tool.sql.Template;
import qj.tool.web.json.Get;
import qj.tool.web.json.Post;
import qj.tool.web.json.Url;
import qj.tool.web.json.UrlParam;

import java.sql.Connection;
import java.util.List;

/**
 * Created by quan on 6/7/2015.
 */
@Url("/challenge/:challengeId")
public class ChallengeService {
    @Get
    public Challenge getAll(@UrlParam("challengeId") Long challengeId, Connection conn) {
        Challenge challenge = ChallengesService.template.selectById(challengeId, conn);
        return challenge;
    }
}

