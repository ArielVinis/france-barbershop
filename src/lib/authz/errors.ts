export class ForbiddenError extends Error {
  readonly status = 403

  constructor(message = "Acesso negado") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends Error {
  readonly status = 404

  constructor(message = "Recurso não encontrado") {
    super(message)
    this.name = "NotFoundError"
  }
}
