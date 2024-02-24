library(ROCR)
library(pROC)

#task 1
english <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task1\\english_res_7.txt", header=FALSE)
tagalog <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task1\\tagalog_res_7.txt", header=FALSE)

english$label <- 0
tagalog$label <- 1

all_data <- rbind(english, tagalog)
all_data <- all_data[order(all_data$V1),]

labels <- all_data$label
values <- all_data$V1

tpr <- c(1)
fpr <- c(1)

for (value in unique(values)) {
  predictions <- as.numeric(values > value)
  pred <- prediction(predictions, labels)
  perf <- performance(pred, "tpr", "fpr")
  tpr <- c(tpr, perf@y.values[[1]][length(perf@y.values[[1]]) - 1])
  fpr <- c(fpr, perf@x.values[[1]][length(perf@x.values[[1]]) - 1])
}

tpr <- c(tpr, 0)
fpr <- c(fpr, 0)
tpr <- rev(tpr)
fpr <- rev(fpr)
print(fpr)


auc <- sum(diff(fpr) * (tpr[-1] + tpr[-length(tpr)]) / 2)

plot(fpr, tpr, type = "l", main = "ROC Curve", xlab = "1 - Specificity", ylab = "Sensitivity")
text(0.5, 0.5, paste("AUC =", round(auc, 2)), adj = c(0.5, 0.5))
abline(a = 0, b = 1, col = "gray")

#task 2

auc_values <- c(0.54,0.74,0.83,0.79,0.73,0.67,0.59,0.52,0.51)
r <- 1:9
plot(r, auc_values, type = "l", main = "AUC Values", xlab = "r", ylab = "auc")

#task 3
english <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task1\\english_res_3.txt", header=FALSE)
other <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task1\\hiligaynon_res.txt", header=FALSE)

english$label <- 0
other$label <- 1

all_data <- rbind(english, other)
all_data <- all_data[order(all_data$V1),]

labels <- all_data$label
values <- all_data$V1

tpr <- c(1)
fpr <- c(1)

for (value in values) {
  predictions <- as.numeric(values > value)
  pred <- prediction(predictions, labels)
  perf <- performance(pred, "tpr", "fpr")
  tpr <- c(tpr, perf@y.values[[1]][length(perf@x.values[[1]]) - 1])
  fpr <- c(fpr, perf@x.values[[1]][length(perf@x.values[[1]]) - 1])
}

tpr <- c(tpr, 0)
fpr <- c(fpr, 0)
tpr <- rev(tpr)
fpr <- rev(fpr)
print(fpr)


auc <- sum(diff(fpr) * (tpr[-1] + tpr[-length(tpr)]) / 2)

plot(fpr, tpr, type = "l", main = "ROC Curve", xlab = "1 - Specificity", ylab = "Sensitivity")
text(0.5, 0.5, paste("AUC =", round(auc, 2)), adj = c(0.5, 0.5))
abline(a = 0, b = 1, col = "gray")