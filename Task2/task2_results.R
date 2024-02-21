library(ROCR)
library(pROC)

results <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-cert_1-7.results", header=FALSE)
lengths <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-cert_1_chunks.lengths", header=FALSE)
labels <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\negative-selection\\negative-selection\\syscalls\\snd-cert\\snd-cert.1.labels", header=FALSE)

results <- results$V1
lengths <- lengths$V1
labels <- labels$V1

i <- 1
currentIndex <- 1
values <- c()
while (i <= length(lengths)) {
  sum <- sum(results[currentIndex:(currentIndex+lengths[i]-1)])
  values <- c(values, sum/lengths[i])
  currentIndex <- currentIndex + lengths[i]
  i <- i+1
}

all_data <- data.frame(
  values = values,
  labels = labels
)
all_data <- all_data[order(all_data$values),]

labels <- all_data$label
values <- all_data$values

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