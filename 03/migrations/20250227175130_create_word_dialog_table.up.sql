CREATE TABLE IF NOT EXISTS word_dialog (
    dialog_id BIGINT REFERENCES dialog(id) ON DELETE CASCADE,
    word_id BIGINT REFERENCES word(id) ON DELETE CASCADE,
    PRIMARY KEY (dialog_id, word_id)
);