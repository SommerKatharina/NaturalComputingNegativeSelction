library(ROCR)
library(pROC)

results <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-cert_all-3_nooverlap_unm.results", header=FALSE)
lengths <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-unm_chunks_nooverlap.lengths", header=FALSE)
labels <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\negative-selection\\negative-selection\\syscalls\\snd-unm\\snd-unm.labels", header=FALSE)

results <- results$V1
lengths <- lengths$V1
labels <- labels$V1

i <- 1
currentIndex <- 1
values <- c()
while (i <= length(lengths)) {
  sum <- sum(results[currentIndex:(currentIndex+lengths[i]-1)])
  non_zero_count <- sum(results[currentIndex:(currentIndex+lengths[i]-1)] != 0)
  if (non_zero_count == 0) {
    values <- c(values, 0)
  } else {
    values <- c(values, sum/non_zero_count)
  }
  #print(median(results[currentIndex:(currentIndex+lengths[i]-1)]))
  #values <- c(values, median(results[currentIndex:(currentIndex+lengths[i]-1)]))
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
print(tpr)

auc <- sum(diff(fpr) * (tpr[-1] + tpr[-length(tpr)]) / 2)

plot(fpr, tpr, type = "l", main = "ROC Curve", xlab = "1 - Specificity", ylab = "Sensitivity")
text(0.5, 0.5, paste("AUC =", round(auc, 2)), adj = c(0.5, 0.5))
abline(a = 0, b = 1, col = "gray")
