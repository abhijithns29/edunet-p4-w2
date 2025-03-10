import Transaction from "../models/TransactionModel.js";
import User from "../models/UserSchema.js";
import moment from "moment";

export const addTransactionController = async (req, res) => {
  try {
    const {
      title,
      amount,
      description,
      date,
      category,
      userId,
      transactionType,
    } = req.body;

    if (!title || !amount || !description || !date || !category || !transactionType) {
      return res.status(408).json({
        success: false,
        messages: "Please Fill all fields",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    let newTransaction = await Transaction.create({
      title,
      amount,
      category,
      description,
      date,
      user: userId,
      transactionType,
    });

    user.transactions.push(newTransaction);
    user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction Added Successfully",
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const getAllTransactionController = async (req, res) => {
  try {
    const { userId, type, frequency, startDate, endDate } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const query = { user: userId };
    if (type !== 'all') {
      query.transactionType = type;
    }
    if (frequency !== 'custom') {
      query.date = {
        $gt: moment().subtract(Number(frequency), "days").toDate()
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate(),
      };
    }

    const transactions = await Transaction.find(query);
    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const deleteTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.body.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const transactionElement = await Transaction.findByIdAndDelete(transactionId);
    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }
    user.transactions = user.transactions.filter(
      (transaction) => transaction._id !== transactionId
    );
    user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction successfully deleted",
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const deleteMultipleTransactionsController = async (req, res) => {
  try {
    const { userId, transactionIds } = req.body;
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty transaction IDs array",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await Transaction.deleteMany({ _id: { $in: transactionIds } });
    user.transactions = user.transactions.filter(
      (t) => !transactionIds.includes(String(t))
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} Transactions successfully deleted`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getSingleTransactionController = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }
    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { title, amount, description, date, category, transactionType } = req.body;
    const transactionElement = await Transaction.findById(transactionId);
    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (title) transactionElement.title = title;
    if (description) transactionElement.description = description;
    if (amount) transactionElement.amount = amount;
    if (category) transactionElement.category = category;
    if (transactionType) transactionElement.transactionType = transactionType;
    if (date) transactionElement.date = date;

    await transactionElement.save();
    return res.status(200).json({
      success: true,
      message: "Transaction Updated Successfully",
      transaction: transactionElement,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

