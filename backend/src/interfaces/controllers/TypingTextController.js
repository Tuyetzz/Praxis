class TypingTextController {
  constructor({
    createTypingText,
    getTypingTexts,
    getPublicTypingTexts,
    getMyTypingTexts,
    getOneTypingText,
    updateTypingText,
    deleteTypingText,
    restoreTypingText,
    hardDeleteTypingText
  }) {
    this.createTypingText = createTypingText;
    this.getTypingTexts = getTypingTexts;
    this.getPublicTypingTexts = getPublicTypingTexts;
    this.getMyTypingTexts = getMyTypingTexts;
    this.getOneTypingText = getOneTypingText;
    this.updateTypingText = updateTypingText;
    this.deleteTypingText = deleteTypingText;
    this.restoreTypingText = restoreTypingText;
    this.hardDeleteTypingText = hardDeleteTypingText;
  }

  async create(req, res) {
    try {
      const authorId = req.user?.id;
      const result = await this.createTypingText.execute({
        ...req.body,
        authorId
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getTypingTexts.execute(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getPublic(req, res) {
    try {
      const result = await this.getPublicTypingTexts.execute();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getMine(req, res) {
    try {
      const authorId = req.user?.id;
      const result = await this.getMyTypingTexts.execute(authorId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const requestUserId = req.user?.id;
      const result = await this.getOneTypingText.execute({
        textId: req.params.id,
        requestUserId
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const authorId = req.user?.id;
      const result = await this.updateTypingText.execute({
        textId: req.params.id,
        authorId,
        updateData: req.body
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const authorId = req.user?.id;
      await this.deleteTypingText.execute({
        textId: req.params.id,
        authorId
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async restore(req, res) {
    try {
      const requestUserId = req.user?.id;
      const requestUserRoles = req.user?.roles || [];
      const result = await this.restoreTypingText.execute({
        textId: req.params.id,
        requestUserId,
        requestUserRoles
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async hardDelete(req, res) {
    try {
      const requestUserId = req.user?.id;
      const requestUserRoles = req.user?.roles || [];
      const result = await this.hardDeleteTypingText.execute({
        textId: req.params.id,
        requestUserId,
        requestUserRoles
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async summarize(req, res) {
    try {
      const { baseUrl, text } = req.body || {};
      const trimmedText = typeof text === 'string' ? text.trim() : '';
      if (!trimmedText) {
        return res.status(400).json({ message: 'Text is required.' });
      }

      const rawBaseUrl = typeof baseUrl === 'string' ? baseUrl.trim() : '';
      if (!rawBaseUrl) {
        return res.status(400).json({ message: 'Ngrok base URL is required.' });
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(rawBaseUrl);
      } catch {
        return res.status(400).json({ message: 'Invalid ngrok base URL.' });
      }

      const host = parsedUrl.hostname;
      const allowedHost = /(^|\.)ngrok-free\.app$|(^|\.)ngrok\.io$/i;
      if (!allowedHost.test(host)) {
        return res.status(400).json({ message: 'Ngrok host is not allowed.' });
      }

      const summarizeUrl = new URL(parsedUrl.href);
      summarizeUrl.pathname = '/summarize';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(summarizeUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: trimmedText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(502).json({ message: 'AI service failed.' });
      }

      const data = await response.json();
      const summary = data?.summary || data?.data?.summary || '';
      if (!summary) {
        return res.status(502).json({ message: 'AI response missing summary.' });
      }

      return res.status(200).json({ summary });
    } catch (error) {
      if (error?.name === 'AbortError') {
        return res.status(504).json({ message: 'AI service timed out.' });
      }
      return res.status(500).json({ message: 'Unable to summarize text.' });
    }
  }
}

module.exports = TypingTextController;
