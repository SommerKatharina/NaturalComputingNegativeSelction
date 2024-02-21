# train files

calculateStringLengths <- function(row) {
  lengths <- nchar(row)
  return(lengths)
}

split_with_overlap <- function(string, chunk_size, overlap) {
  chunks <- c()
  for (i in seq(1, nchar(string), chunk_size)) {
    chunks <- c(chunks, substr(string, i, i + chunk_size - 1))
  }
  if (nchar(chunks[length(chunks)]) < chunk_size) {
    chunks[length(chunks)] <- substr(string, nchar(string) - 6, nchar(string))
  }
  #for (i in seq(5, nchar(string), chunk_size)) {
  #  chunks <- c(chunks, substr(string, i, i + chunk_size - 1))
  #}
  #if (nchar(chunks[length(chunks)]) < chunk_size) {
  #  chunks <- chunks[-length(chunks)]
  #}
  return(chunks)
}

train_cert <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\negative-selection\\negative-selection\\syscalls\\snd-cert\\snd-cert.train", header=FALSE)

chunk_size_cert <- min(apply(train_cert, 1, calculateStringLengths))
overlap_cert <- 3

all_chunks_cert <- c()
for (value in train_cert$V1) {
  all_chunks_cert <- c(all_chunks_cert, split_with_overlap(value, chunk_size_cert, overlap_cert))
}

print(length(all_chunks_cert))
all_chunks_cert <- unique(all_chunks_cert)
print(length(all_chunks_cert))

writeLines(all_chunks_cert, "C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-cert_chunks.train")

train_unm <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\negative-selection\\negative-selection\\syscalls\\snd-unm\\snd-unm.train", header=FALSE)

chunk_size_unm <- min(apply(train_unm, 1, calculateStringLengths))
overlap_unm <- 3

all_chunks_unm <- c()
for (value in train_unm$V1) {
  all_chunks_unm <- c(all_chunks_unm, split_with_overlap(value, chunk_size_unm, overlap_unm))
}

print(length(all_chunks_unm))
all_chunks_unm <- unique(all_chunks_unm)
print(length(all_chunks_unm))

writeLines(all_chunks_unm, "C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-unm_chunks.train")

# test files

test_cert_1 <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\negative-selection\\negative-selection\\syscalls\\snd-cert\\snd-cert.3.test", header=FALSE)
#test_cert_1_labels <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\negative-selection\\negative-selection\\syscalls\\snd-cert\\snd-cert.3.labels", header=FALSE)

all_chunks_cert_test_1 <- c()
#all_lables_cert_test_1 <- c()
all_lengths_cert_test_1 <- c()
for (i in 1:length(test_cert_1$V1)) {
  ret_chunks <- split_with_overlap(test_cert_1$V1[i], chunk_size_cert, overlap_cert)
  all_chunks_cert_test_1 <- c(all_chunks_cert_test_1, ret_chunks)
  #all_lables_cert_test_1 <- c(all_lables_cert_test_1, rep(test_cert_1_labels$V1[i], length(ret_chunks)))
  all_lengths_cert_test_1 <- c(all_lengths_cert_test_1, length(ret_chunks))
}

writeLines(all_chunks_cert_test_1, "C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-cert_3_chunks_nooverlap.test")
#writeLines(as.character(all_lables_cert_test_1), "C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-cert_3_chunks.labels")
writeLines(as.character(all_lengths_cert_test_1), "C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-cert_3_chunks_nooverlap.lengths")

test_unm_1 <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\negative-selection\\negative-selection\\syscalls\\snd-unm\\snd-unm.1.test", header=FALSE)
#test_unm_1_labels <- read.csv("C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\negative-selection\\negative-selection\\syscalls\\snd-unm\\snd-unm.3.labels", header=FALSE)

all_chunks_unm_test_1 <- c()
#all_lables_unm_test_1 <- c()
all_lengths_unm_test_1 <- c()
for (i in 1:length(test_unm_1$V1)) {
  ret_chunks <- split_with_overlap(test_unm_1$V1[i], chunk_size_unm, overlap_unm)
  all_chunks_unm_test_1 <- c(all_chunks_unm_test_1, ret_chunks)
  #all_lables_unm_test_1 <- c(all_lables_unm_test_1, rep(test_unm_1_labels$V1[i], length(ret_chunks)))
  all_lengths_unm_test_1 <- c(all_lengths_unm_test_1, length(ret_chunks))
}

writeLines(all_chunks_unm_test_1, "C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-unm_1_chunks.test")
#writeLines(as.character(all_lables_unm_test_1), "C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-unm_3_chunks.labels")
writeLines(as.character(all_lengths_unm_test_1), "C:\\Users\\kathi\\Documents\\Studium\\Master\\SS24\\NaCo\\Assignment\\Assignment3\\Task2\\snd-unm_1_chunks.lengths")
