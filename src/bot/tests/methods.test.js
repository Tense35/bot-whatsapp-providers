const { test } = require('uvu')
const assert = require('uvu/assert')
const { generateRefSerialize } = require('../utils/hash')
const { addKeyword, addAnswer, toSerialize } = require('../io/methods')

test('Debere probar las propeidades', () => {
    const ARRANGE = {
        keyword: 'hola!',
    }
    const MAIN_CTX = addKeyword(ARRANGE.keyword)

    assert.type(MAIN_CTX.addAnswer, 'function')
    assert.is(MAIN_CTX.ctx.keyword, ARRANGE.keyword)
})

test('Debere probar las propeidades array', () => {
    const ARRANGE = {
        keyword: ['hola!', 'ole'],
    }
    const MAIN_CTX = addKeyword(ARRANGE.keyword)

    assert.is(MAIN_CTX.ctx.keyword, ARRANGE.keyword)
})

test('Debere probar las propeidades array en answer', () => {
    const ARRANGE = {
        keyword: ['hola!', 'ole'],
    }
    const MAIN_CTX = addKeyword(ARRANGE.keyword).addAnswer(['hola', 'chao'])

    assert.is(MAIN_CTX.ctx.keyword, ARRANGE.keyword)
})

test('Debere probar toSerialize', () => {
    const ARRANGE = {
        keyword: ['hola!', 'ole'],
    }
    const MAIN_CTX = addKeyword(ARRANGE.keyword).addAnswer('Segundo!').addAnswer('Segundo!').toJson()

    const [ANSWER_A] = MAIN_CTX

    assert.is(
        toSerialize(MAIN_CTX)[0].refSerialize,
        generateRefSerialize({
            index: 0,
            answer: ANSWER_A.answer,
            keyword: ANSWER_A.keyword,
        })
    )
})

test('Debere probar el paso de contexto', () => {
    const ARRANGE = {
        keyword: 'hola!',
        answer: 'Bienvenido',
    }
    const CTX_A = addKeyword(ARRANGE.keyword)
    const CTX_B = addAnswer(CTX_A)(ARRANGE.answer)

    assert.is(CTX_A.ctx.keyword, ARRANGE.keyword)
    assert.is(CTX_B.ctx.keyword, ARRANGE.keyword)
    assert.is(CTX_B.ctx.answer, ARRANGE.answer)
})

test('Debere probar la anidación', () => {
    const ARRANGE = {
        keyword: 'hola!',
        answer_A: 'Bienvenido',
        answer_B: 'Continuar',
    }
    const MAIN_CTX = addKeyword(ARRANGE.keyword).addAnswer(ARRANGE.answer_A).addAnswer(ARRANGE.answer_B)

    assert.is(MAIN_CTX.ctx.answer, ARRANGE.answer_B)
})

test('Debere probar las poptions', () => {
    const MAIN_CTX = addKeyword('etc', { sensitive: false })

    assert.is(MAIN_CTX.ctx.options.sensitive, false)
})

test('Debere probar las addAnswer', () => {
    const MOCK_OPT = {
        media: 'http://image.mock/mock.png',
        buttons: [1],
    }
    const MAIN_CTX = addKeyword('hola').addAnswer('etc', MOCK_OPT)

    assert.is(MAIN_CTX.ctx.options.media, MOCK_OPT.media)
    assert.is(MAIN_CTX.ctx.options.buttons.length, 1)
})

test('Debere probar error las addAnswer', () => {
    const MOCK_OPT = {
        media: { a: 1, b: [] },
        buttons: 'test',
    }
    const MAIN_CTX = addKeyword('hola').addAnswer('etc', MOCK_OPT)

    assert.is(MAIN_CTX.ctx.options.media, null)
    assert.is(MAIN_CTX.ctx.options.buttons.length, 0)
})

test('Obtener toJson', () => {
    const [ctxA, ctxB, ctxC] = addKeyword('hola').addAnswer('pera!').addAnswer('chao').toJson()

    assert.is(ctxA.keyword, 'hola')
    assert.match(ctxA.ref, /^key_/)

    assert.is(ctxB.answer, 'pera!')
    assert.match(ctxB.ref, /^ans_/)

    assert.is(ctxC.answer, 'chao')
    assert.match(ctxC.ref, /^ans_/)
})

test('addKeyword toJson con sensitive', () => {
    const [ctxA] = addKeyword('hola').toJson()
    assert.is(ctxA.options.sensitive, false)
    const [ctxB] = addKeyword('hola', { sensitive: true }).toJson()
    assert.is(ctxB.options.sensitive, true)
})

test('addAnswer toJson con IMG', () => {
    const [, ctxB, ctxC] = addKeyword('hola')
        .addAnswer('bye!', {
            media: 'http://mock.img/file-a.png',
        })
        .addAnswer('otro!', {
            media: 'http://mock.img/file-b.png',
        })
        .toJson()

    assert.is(ctxB.options.media, 'http://mock.img/file-a.png')
    assert.is(ctxC.options.media, 'http://mock.img/file-b.png')
})

test('addAnswer toJson con BUTTONS', () => {
    const [, ctxB] = addKeyword('hola')
        .addAnswer('mis opciones!', {
            buttons: [{ body: 'BTN_1' }, { body: 'BTN_2' }],
        })
        .toJson()

    assert.is(ctxB.options.buttons.length, 2)

    const [btnA, btnB] = ctxB.options.buttons

    assert.is(btnA.body, 'BTN_1')
    assert.is(btnB.body, 'BTN_2')
})

test.run()
