import { Request, Response, NextFunction } from "express";

/**
 * Validates ObjectID/String ID params for product/user retrieval, updating, deletions.
 * Accepts alphanumeric characters only, lengths 8-30.
 * Completely eliminates NoSQL injection payloads ($gt, object dictionaries) or odd symbols in paths.
 */
export function validateIdParam(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Parameter error: Missing 'id' in path." });
    return;
  }

  // Allow alphanumeric characters only, length between 8 and 30 characters (supports both custom random strings and Mongo ObjectIds)
  const safeIdRegex = /^[a-zA-Z0-9]{8,30}$/;
  if (!safeIdRegex.test(id)) {
    res.status(400).json({ message: "Security block: Malformed or invalid 'id' structure." });
    return;
  }
  next();
}

/**
 * Validates Category string params to be safe.
 * Permits letters, numbers, hyphens, and spaces.
 */
export function validateCategoryParam(req: Request, res: Response, next: NextFunction): void {
  const { category } = req.params;
  if (!category) {
    res.status(400).json({ message: "Parameter error: Missing 'category' in path." });
    return;
  }

  // Category must be a safe string, no special injection tokens, path traversals or tags
  const safeCategoryRegex = /^[a-zA-Z0-9\s\-_]{1,50}$/;
  if (!safeCategoryRegex.test(category)) {
    res.status(400).json({ message: "Security block: Insecure or malformed 'category' format." });
    return;
  }
  next();
}

/**
 * Validates Register User Payload
 */
export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 50) {
    res.status(400).json({ message: "Validation failed: 'name' must be between 2 and 50 characters." });
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 100) {
    res.status(400).json({ message: "Validation failed: Please enter a valid, safe email address." });
    return;
  }

  if (!password || typeof password !== "string" || password.length < 6 || password.length > 60) {
    res.status(400).json({ message: "Validation failed: 'password' must be between 6 and 60 characters." });
    return;
  }

  // Sanitize name trim and lowercase email for data reliability
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
}

/**
 * Validates Login payload
 */
export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    res.status(400).json({ message: "Validation failed: Invalid email format." });
    return;
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    res.status(400).json({ message: "Validation failed: Password payload is required." });
    return;
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

/**
 * Validates Product Creation Payload
 */
export function validateProductCreation(req: Request, res: Response, next: NextFunction): void {
  const { title, description, price, category, stock } = req.body;

  if (!title || typeof title !== "string" || title.trim().length < 2 || title.trim().length > 100) {
    res.status(400).json({ message: "Validation failed: 'title' is required and must be between 2 and 100 characters." });
    return;
  }

  if (!description || typeof description !== "string" || description.trim().length < 10 || description.trim().length > 1200) {
    res.status(400).json({ message: "Validation failed: 'description' is required and must be between 10 and 1200 characters." });
    return;
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 100000) {
    res.status(400).json({ message: "Validation failed: 'price' must be a valid positive number up to $100,000." });
    return;
  }

  if (!category || typeof category !== "string" || category.trim().length < 2 || category.trim().length > 50) {
    res.status(400).json({ message: "Validation failed: 'category' is required (2-50 characters)." });
    return;
  }

  if (stock !== undefined) {
    const numericStock = Number(stock);
    if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
      res.status(400).json({ message: "Validation failed: 'stock' must be a non-negative integer." });
      return;
    }
  }

  // Save sanitized trimmed inputs back to body
  req.body.title = title.trim();
  req.body.description = description.trim();
  req.body.price = numericPrice;
  req.body.category = category.trim();
  if (stock !== undefined) {
    req.body.stock = Number(stock);
  }

  next();
}

/**
 * Validates Product Update Payload (Keys are optional, but if specified, must align with strict types)
 */
export function validateProductUpdate(req: Request, res: Response, next: NextFunction): void {
  const { title, description, price, category, stock } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 2 || title.trim().length > 100) {
      res.status(400).json({ message: "Validation failed: Updated 'title' must be between 2 and 100 characters." });
      return;
    }
    req.body.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length < 10 || description.trim().length > 1200) {
      res.status(400).json({ message: "Validation failed: Updated 'description' must be between 10 and 1200 characters." });
      return;
    }
    req.body.description = description.trim();
  }

  if (price !== undefined) {
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 100000) {
      res.status(400).json({ message: "Validation failed: Updated 'price' must be a valid positive number up to $100,000." });
      return;
    }
    req.body.price = numericPrice;
  }

  if (category !== undefined) {
    if (typeof category !== "string" || category.trim().length < 2 || category.trim().length > 50) {
      res.status(400).json({ message: "Validation failed: Updated 'category' must be between 2 and 50 characters." });
      return;
    }
    req.body.category = category.trim();
  }

  if (stock !== undefined) {
    const numericStock = Number(stock);
    if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
      res.status(400).json({ message: "Validation failed: Updated 'stock' must be a non-negative integer." });
      return;
    }
    req.body.stock = numericStock;
  }

  next();
}

/**
 * Validates chat request inputs
 */
export function validateChatMessagePayload(req: Request, res: Response, next: NextFunction): void {
  const { message, messages } = req.body;

  if (message !== undefined) {
    if (typeof message !== "string" || message.trim().length === 0 || message.length > 4000) {
      res.status(400).json({ message: "Validation failed: 'message' must be a non-empty string under 4000 characters." });
      return;
    }
    req.body.message = message.trim();
  }

  if (messages !== undefined) {
    if (!Array.isArray(messages)) {
      res.status(400).json({ message: "Validation failed: 'messages' context must be a valid historic entries array." });
      return;
    }

    if (messages.length > 50) {
      res.status(400).json({ message: "Validation failed: History capacity exceeded (maximum 50 messages allowed)." });
      return;
    }

    // Validate structure of and sanitize messages
    for (const msg of messages) {
      if (typeof msg !== "object" || msg === null) {
        res.status(400).json({ message: "Validation failed: Historic message item must be a valid object." });
        return;
      }
      const role = msg.role;
      const content = msg.content || msg.text;

      if (role !== "user" && role !== "model" && role !== "assistant") {
        res.status(400).json({ message: "Validation failed: Invalid message role. Allowed roles are: 'user', 'model', 'assistant'." });
        return;
      }

      if (typeof content !== "string" || content.trim().length === 0 || content.length > 4000) {
        res.status(400).json({ message: "Validation failed: Message text contents cannot be empty or exceed 4000 characters." });
        return;
      }
    }
  }

  next();
}
