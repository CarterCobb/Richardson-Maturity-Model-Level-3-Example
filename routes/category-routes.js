import eRequestType from "../eRequestType.js";
import eHATEOAS from "../eHATEOAS.js";
import {
  makeId,
  generate400Response,
  sendError,
  hateoasActions,
} from "../helper-functions.js";
import { getCategoriesFromFile, writeCategoriesToFile } from "../repo.js";

const { ALL, DELETE, PATCH, PUT } = eHATEOAS;

export const routes = [
  {
    url: "/api/cat",
    type: eRequestType.GET,
    handler: (req, res) => {
      try {
        const data = getCategoriesFromFile();
        return res
          .status(200)
          .json({ data, _links: hateoasActions(data, "api/cat", "cat") });
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/cat/:id",
    type: eRequestType.GET,
    handler: (req, res) => {
      const {
        params: { id },
      } = req;
      if (!/^cat_[A-z0-9]{6}$/.test(`cat_${id}`)) {
        return res.status(400).json(generate400Response());
      }
      try {
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/cat",
    type: eRequestType.POST,
    handler: (req, res) => {
      const category = { ...req.body };
      const keys = Object.keys(category);
      if (keys.length === 0 || !keys.includes("name")) {
        return res.status(400).json(generate400Response());
      }
      category.creation_date = new Date(Date.now()).toISOString();
      category._id = `cat_${makeId(6)}`;
      try {
        var categories = getCategoriesFromFile();
        if (!(categories instanceof Array)) {
          categories = [category];
        } else {
          categories.push(category);
        }
        writeCategoriesToFile(categories);
        return res.status(201).json(category);
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/cat/:id",
    type: eRequestType.PUT,
    handler: (req, res) => {
      const {
        params: { id },
        body,
      } = req;
      if (!/^cat_[A-z0-9]{6}$/.test(`cat_${id}`)) {
        return res.status(400).json(generate400Response());
      }
      const keys = Object.keys({ ...body });
      if (keys.length === 0 || !keys.includes("name")) {
        return res.status(400).json(generate400Response());
      }
      try {
        var categories = getCategoriesFromFile();
        var old_category = {};
        if (!(categories instanceof Array)) {
          categories = [];
        } else {
          if (
            categories.filter((cat) => cat._id === `cat_${id}`).length === 0
          ) {
            return res.sendStatus(404);
          }
          old_category = categories.find((cat) => cat._id === `cat_${id}`);
          categories = categories.filter((cat) => cat._id !== `cat_${id}`);
          categories.push({ ...old_category, name: body.name });
        }
        writeCategoriesToFile(categories);
        return res.status(200).json({ ...old_category, name: body.name });
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/cat/:id",
    type: eRequestType.PATCH,
    handler: (req, res) => {
      const {
        params: { id },
        body,
      } = req;
      if (!/^cat_[A-z0-9]{6}$/.test(`cat_${id}`)) {
        return res.status(400).json(generate400Response());
      }
      const keys = Object.keys({ ...body });
      if (keys.length === 0) {
        return res.status(400).json(generate400Response());
      }
      try {
        var categories = getCategoriesFromFile();
        var mutate_cat = {};
        if (!(categories instanceof Array)) {
          return res.sendStatus(422);
        } else {
          if (
            categories.filter((cat) => cat._id === `cat_${id}`).length === 0
          ) {
            return res.sendStatus(404);
          }
          mutate_cat = categories.find((cat) => cat._id === `cat_${id}`);
          categories = categories.filter((cat) => cat._id !== `cat_${id}`);
          for (var key of keys) {
            if (Object.keys(mutate_cat).includes(key)) {
              mutate_cat[key] = body[key];
            }
          }
          categories.push(mutate_cat);
          writeCategoriesToFile(categories);
          return res.status(200).json(mutate_cat);
        }
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
  {
    url: "/api/cat/:id",
    type: eRequestType.DELETE,
    handler: (req, res) => {
      const { id } = req.params;
      if (!/^cat_[A-z0-9]{6}$/.test(`cat_${id}`)) {
        return res.status(400).json(generate400Response());
      }
      try {
        var categories = getCategoriesFromFile();
        if (!(categories instanceof Array)) {
          return res.sendStatus(422);
        } else {
          if (
            categories.filter((cat) => cat._id === `cat_${id}`).length === 0
          ) {
            return res.sendStatus(404);
          }
          categories = categories.filter((cat) => cat._id !== `cat_${id}`);
        }
        writeCategoriesToFile(categories);
        return res.sendStatus(204);
      } catch (err) {
        return sendError(res, 500)(err);
      }
    },
  },
];
