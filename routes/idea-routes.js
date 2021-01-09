import eRequestType from "../enums/eRequestType.js";
import eHATEOAS from "../enums/eHATEOAS.js";
import {
  makeId,
  generate400Response,
  sendError,
  hateoasActions,
} from "../helper-functions.js";
import {
  getIdeasFromFile,
  writeIdeasToFile,
  getCategoriesFromFile,
} from "../repo.js";

const { ALL, DELETE, PATCH, PUT, CAT } = eHATEOAS;

/*
  Structure of an idea object:
  {
    "idea": "An idea...",
    "ideaist": "Name of ideaist",
    "category": "cat_123456",
    "creation_date": "2021-01-09T04:13:04.550Z", // This is set server side
    "_id": "idea_123456", // This is set server side.
  }
*/
export const routes = [
  {
    url: "/api/idea",
    type: eRequestType.GET,
    handler: (req, res) => {
      try {
        const data = getIdeasFromFile();
        return res
          .status(200)
          .json({ data, _links: hateoasActions(data, "api/idea", "idea") });
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/idea/:id",
    type: eRequestType.GET,
    handler: (req, res) => {
      const {
        params: { id },
      } = req;
      if (!/^idea_[A-z0-9]{6}$/.test(`idea_${id}`)) {
        return res.status(400).json(generate400Response());
      }
      try {
        const all_data = getIdeasFromFile();
        if (!(all_data instanceof Array)) {
          return res.sendStatus(422);
        } else {
          if (
            all_data.filter((idea) => idea._id === `idea_${id}`).length === 0
          ) {
            return res.sendStatus(404);
          }
        }
        const idea = all_data.find((idea) => idea._id === `idea_${id}`);
        return res.status(200).json({
          data: idea,
          _links: hateoasActions(idea, `api/idea/${id}`, "idea", [
            ALL,
            DELETE,
            PATCH,
            PUT,
            CAT
          ]),
        });
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/idea",
    type: eRequestType.POST,
    handler: (req, res) => {
      const idea = { ...req.body };
      const keys = Object.keys(idea);
      if (
        keys.length === 0 ||
        !keys.includes("idea") ||
        !keys.includes("ideaist")
      ) {
        return res.status(400).json(generate400Response());
      }
      if (keys.includes("category")) {
        const categories = getCategoriesFromFile();
        if (!(categories instanceof Array)) {
          idea.category = undefined;
        } else {
          if (
            categories.filter((cat) => cat._id === req.body.category).length === 0
          ) {
            return res.sendStatus(404);
          }
        }
      }
      idea.creation_date = new Date(Date.now()).toISOString();
      idea._id = `idea_${makeId(6)}`;
      try {
        var ideas = getIdeasFromFile();
        if (!(ideas instanceof Array)) {
          ideas = [idea];
        } else {
          ideas.push(idea);
        }
        writeIdeasToFile(ideas);
        return res.status(201).json({
          new_idea: idea,
          _links: hateoasActions(idea, "api/idea", "idea", [
            ALL,
            PUT,
            PATCH,
            DELETE,
            CAT
          ]),
        });
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/idea/:id",
    type: eRequestType.PUT,
    handler: (req, res) => {
      const {
        params: { id },
        body,
      } = req;
      if (!/^idea_[A-z0-9]{6}$/.test(`idea_${id}`)) {
        return res.status(400).json(generate400Response());
      }
      const keys = Object.keys({ ...body });
      if (
        keys.length === 0 ||
        !keys.includes("idea") ||
        !keys.includes("ideaist")
      ) {
        return res.status(400).json(generate400Response());
      }
      if (keys.includes("category")) {
        const categories = getCategoriesFromFile();
        if (!(categories instanceof Array)) {
          return res.sendStatus(409);
        } else {
          if (
            categories.filter((cat) => cat._id === body.category).length === 0
          ) {
            return res.sendStatus(404);
          }
        }
      }
      try {
        var ideas = getIdeasFromFile();
        var old_idea = {};
        var final_obj = {};
        if (!(ideas instanceof Array)) {
          return res.sendStatus(422);
        } else {
          if (ideas.filter((idea) => idea._id === `idea_${id}`).length === 0) {
            return res.sendStatus(404);
          }
          old_idea = ideas.find((idea) => idea._id === `idea_${id}`);
          ideas = ideas.filter((idea) => idea._id !== `idea_${id}`);
          final_obj = { ...old_idea, idea: body.idea, ideaist: body.ideaist };
          ideas.push(final_obj);
        }
        writeIdeasToFile(ideas);
        return res.status(200).json({
          put_idea: final_obj,
          _links: hateoasActions(final_obj, `api/idea/${id}`, "idea", [
            ALL,
            PATCH,
            DELETE,
            CAT
          ]),
        });
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/idea/:id",
    type: eRequestType.PATCH,
    handler: (req, res) => {
      const {
        params: { id },
        body,
      } = req;
      if (!/^idea_[A-z0-9]{6}$/.test(`idea_${id}`)) {
        return res.status(400).json(generate400Response());
      }
      const keys = Object.keys({ ...body });
      if (keys.length === 0) {
        return res.status(400).json(generate400Response());
      }
      try {
        var ideas = getIdeasFromFile();
        var mutate_idea = {};
        if (!(ideas instanceof Array)) {
          return res.sendStatus(422);
        } else {
          if (ideas.filter((idea) => idea._id === `idea_${id}`).length === 0) {
            return res.sendStatus(404);
          }
          mutate_idea = ideas.find((idea) => idea._id === `idea_${id}`);
          ideas = ideas.filter((idea) => idea._id !== `idea_${id}`);
          for (var key of keys) {
            if (Object.keys(mutate_idea).includes(key) || key === "category") {
              if (key === "category") {
                const categories = getCategoriesFromFile();
                if (!(categories instanceof Array)) {
                  return res.sendStatus(409);
                } else {
                  if (
                    categories.filter((cat) => cat._id === body.category)
                      .length === 0
                  ) {
                    return res.sendStatus(404);
                  }
                }
              }
              mutate_idea[key] = body[key];
            }
          }
          ideas.push(mutate_idea);
        }
        writeIdeasToFile(ideas);
        return res.status(200).json({
          patched_idea: mutate_idea,
          _links: hateoasActions(mutate_idea, `api/idea/${id}`, "idea", [
            ALL,
            PUT,
            DELETE,
            CAT
          ]),
        });
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/idea/:id",
    type: eRequestType.DELETE,
    handler: (req, res) => {
      const { id } = req.params;
      if (!/^idea_[A-z0-9]{6}$/.test(`idea_${id}`)) {
        return res.status(400).json(generate400Response());
      }
      try {
        var ideas = getIdeasFromFile();
        if (!(ideas instanceof Array)) {
          return res.sendStatus(422);
        } else {
          if (ideas.filter((idea) => idea._id === `idea_${id}`).length === 0) {
            return res.sendStatus(404);
          }
          ideas = ideas.filter((idea) => idea._id !== `idea_${id}`);
        }
        writeIdeasToFile(ideas);
        return res.sendStatus(204);
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
];
