const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const { insert, select } = require('./db');

function catchErrors(fn) {
    return (req, res, next) => fn(rec,res,next).catch(next);
}

function sanitizeXss(fieldName) {
    return (req, res, next) => {
        if(!req.body) {
            next();
        }

        const field = req.body[fieldName];

        if(field) {
            req.body[fieldName] = xss(field);
        }

        next();
    };
}

const router = express.Router();

const validations = [
    check('name')
        .isLength({ min: 1 })
        .withMessage('Nafn má ekki vera tómt'),

    check('nationalId')
        .matches(/^[0-9]{6}( |-)?[0-9]{4}$/)
        .withMessage('Kennitala verður að vera á forminu 000000-0000 eða 0000000000'),

    check('comment')
        .isLength({ max: 400 })
        .withMessage('Athugasemd má að hámarki vera 400 stafir')
];

const sanitazions = [
    sanitize('name').trim().escape(),
    sanitizeXss('name'),

    sanitizeXss('nationalId'),
    sanitize('nationalId')
        .trim().blacklist(' ').escape()
        .toInt(),

    sanitizeXss('comment'),
    sanitize('comment').trim().escape(),
];

function form(req, res) {
    const data = {
        title: 'Undirskriftalisti',
        name: '',
        nationalId: '',
        comment: '',
        errors: [],
        list,
    };
    res.render('form', data);
}

function showErrors(req, res, next) {
    const {
        body: {
            name = '',
            nationalId = '',
            comment = '',
        } = {},
    } = req;

    const data = {
        name,
        nationalId,
        comment,
    };

    const validation = validationResult(req);

    if(!validation.isEmpty()) {
        const errors = validation.array();
        data.errors = errors;
        data.title = 'Undirskriftalisti - vandræði';

        return res.render('form', data);
    }

    return next();
}

async function formPost(req, res) {
    const {
        body: {
            name = '',
            nationalId = '',
            comment = '',
        } = {}
    } = req;

    const data = {
        name,
        nationalId,
        comment,
    }

    await insert(data);

    return res.render('form', data);
}

router.get('/', form);

router.post(
    '/',
    validations,
    showErrors,
    sanitazions,
    catchErrors(formPost),
);

module.exports = router;